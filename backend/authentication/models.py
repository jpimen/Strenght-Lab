"""
Models for authentication.

Uses a custom User that stores id as a UUID, matching the original
Node.js backend's data schema.  Sessions and PasswordResets are
standalone tables (not Django's built-in session framework) so the
API contract stays identical.
"""

import hashlib
import os
import uuid
from datetime import timedelta

from django.conf import settings
from django.db import models
from django.utils import timezone


def _hash_secret(salt_hex: str, text: str) -> str:
    """PBKDF2-SHA256 hash matching the original Node.js implementation."""
    dk = hashlib.pbkdf2_hmac(
        "sha256",
        text.encode("utf-8"),
        bytes.fromhex(salt_hex),
        settings.PBKDF2_ITERATIONS,
        dklen=32,
    )
    return dk.hex()


def _random_salt() -> str:
    return os.urandom(16).hex()


class User(models.Model):
    """Application user — mirrors the original JSON schema."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    password_salt = models.CharField(max_length=64)
    password_hash = models.CharField(max_length=128)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "auth_user"

    # ---- helpers ----

    def set_password(self, raw_password: str) -> None:
        self.password_salt = _random_salt()
        self.password_hash = _hash_secret(self.password_salt, raw_password)

    def check_password(self, raw_password: str) -> bool:
        expected = _hash_secret(self.password_salt, raw_password)
        # constant-time compare
        return hmac_compare(self.password_hash, expected)

    def to_public(self) -> dict:
        return {
            "id": str(self.id),
            "fullName": self.full_name,
            "email": self.email,
            "createdAt": self.created_at.isoformat().replace("+00:00", "Z"),
        }

    def __str__(self) -> str:
        return self.email


class Session(models.Model):
    """Bearer-token session — mirrors the original JSON schema."""

    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sessions")
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        db_table = "auth_session"

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(days=settings.SESSION_TTL_DAYS)
        super().save(*args, **kwargs)

    @property
    def is_expired(self) -> bool:
        return timezone.now() > self.expires_at

    def to_dict(self) -> dict:
        return {
            "token": str(self.token),
            "user": self.user.to_public(),
            "createdAt": self.created_at.isoformat().replace("+00:00", "Z"),
            "expiresAt": self.expires_at.isoformat().replace("+00:00", "Z"),
        }

    def __str__(self) -> str:
        return f"Session {self.token} ({self.user.email})"


class PasswordReset(models.Model):
    """One-time reset code — mirrors the original JSON schema."""

    email = models.EmailField()
    code_salt = models.CharField(max_length=64)
    code_hash = models.CharField(max_length=128)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        db_table = "auth_password_reset"

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(
                minutes=settings.PASSWORD_RESET_TTL_MINUTES
            )
        super().save(*args, **kwargs)

    @property
    def is_expired(self) -> bool:
        return timezone.now() > self.expires_at

    def check_code(self, code: str) -> bool:
        expected = _hash_secret(self.code_salt, code)
        return hmac_compare(self.code_hash, expected)

    def __str__(self) -> str:
        return f"PasswordReset for {self.email}"


# ---- constant-time comparison ----

import hmac as _hmac


def hmac_compare(a: str, b: str) -> bool:
    return _hmac.compare_digest(a.encode(), b.encode())
