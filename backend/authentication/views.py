"""
Authentication API views.

Every endpoint matches the original Node.js backend 1-for-1 so the
frontend requires zero changes.

Endpoints:
  POST /api/auth/signup
  POST /api/auth/login
  GET  /api/auth/session
  POST /api/auth/logout
  POST /api/auth/password-reset/request
  POST /api/auth/password-reset/confirm
"""

import json
import random
import re

from django.http import JsonResponse, HttpResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from .models import User, Session, PasswordReset, _hash_secret, _random_salt


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def _json_error(code: str, status: int = 400) -> JsonResponse:
    return JsonResponse({"code": code}, status=status)


def _parse_body(request) -> dict:
    """Parse JSON body from the request, limit 1 MB."""
    if len(request.body) > 1024 * 1024:
        raise _ApiError("AUTH_REQUEST_TOO_LARGE", 413)
    if not request.body:
        return {}
    try:
        return json.loads(request.body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        raise _ApiError("AUTH_INVALID_REQUEST", 400)


def _get_bearer_token(request) -> str | None:
    auth = request.META.get("HTTP_AUTHORIZATION", "")
    if auth.startswith("Bearer "):
        token = auth[7:].strip()
        return token or None
    return None


class _ApiError(Exception):
    def __init__(self, code: str, status: int = 400):
        super().__init__(code)
        self.code = code
        self.status = status


# ---------------------------------------------------------------------------
# Views
# ---------------------------------------------------------------------------


@method_decorator(csrf_exempt, name="dispatch")
class SignUpView(View):
    def post(self, request):
        try:
            body = _parse_body(request)
            full_name = (body.get("fullName") or "").strip()
            email = (body.get("email") or "").strip().lower()
            password = body.get("password") or ""

            if not full_name:
                return _json_error("AUTH_FULL_NAME_REQUIRED")
            if not email:
                return _json_error("AUTH_EMAIL_REQUIRED")
            if not EMAIL_RE.match(email):
                return _json_error("AUTH_EMAIL_INVALID")
            if not password:
                return _json_error("AUTH_PASSWORD_REQUIRED")
            if len(password) < 8:
                return _json_error("AUTH_PASSWORD_TOO_SHORT")

            if User.objects.filter(email=email).exists():
                return _json_error("AUTH_EMAIL_IN_USE", 409)

            user = User(full_name=full_name, email=email)
            user.set_password(password)
            user.save()

            session = Session(user=user)
            session.save()

            return JsonResponse(session.to_dict(), status=201)

        except _ApiError as e:
            return _json_error(e.code, e.status)


@method_decorator(csrf_exempt, name="dispatch")
class LogInView(View):
    def post(self, request):
        try:
            body = _parse_body(request)
            email = (body.get("email") or "").strip().lower()
            password = body.get("password") or ""

            if not email:
                return _json_error("AUTH_EMAIL_REQUIRED")
            if not EMAIL_RE.match(email):
                return _json_error("AUTH_EMAIL_INVALID")
            if not password:
                return _json_error("AUTH_PASSWORD_REQUIRED")

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return _json_error("AUTH_INVALID_CREDENTIALS", 401)

            if not user.check_password(password):
                return _json_error("AUTH_INVALID_CREDENTIALS", 401)

            session = Session(user=user)
            session.save()

            return JsonResponse(session.to_dict(), status=200)

        except _ApiError as e:
            return _json_error(e.code, e.status)


@method_decorator(csrf_exempt, name="dispatch")
class SessionView(View):
    def get(self, request):
        token = _get_bearer_token(request)
        if not token:
            return _json_error("AUTH_UNAUTHORIZED", 401)

        try:
            session = Session.objects.select_related("user").get(token=token)
        except Session.DoesNotExist:
            return _json_error("AUTH_INVALID_SESSION", 401)

        if session.is_expired:
            session.delete()
            return _json_error("AUTH_INVALID_SESSION", 401)

        return JsonResponse(session.to_dict(), status=200)


@method_decorator(csrf_exempt, name="dispatch")
class LogOutView(View):
    def post(self, request):
        token = _get_bearer_token(request)
        if token:
            Session.objects.filter(token=token).delete()
        return HttpResponse(status=204)


@method_decorator(csrf_exempt, name="dispatch")
class RequestPasswordResetView(View):
    def post(self, request):
        try:
            body = _parse_body(request)
            email = (body.get("email") or "").strip().lower()

            if not email:
                return _json_error("AUTH_EMAIL_REQUIRED")
            if not EMAIL_RE.match(email):
                return _json_error("AUTH_EMAIL_INVALID")

            if not User.objects.filter(email=email).exists():
                return _json_error("AUTH_USER_NOT_FOUND", 404)

            # Generate 6-digit code
            reset_code = str(random.randint(0, 999_999)).zfill(6)
            code_salt = _random_salt()
            code_hash = _hash_secret(code_salt, reset_code)

            # Remove any existing resets for this email
            PasswordReset.objects.filter(email=email).delete()

            pr = PasswordReset(
                email=email,
                code_salt=code_salt,
                code_hash=code_hash,
            )
            pr.save()

            return JsonResponse(
                {
                    "email": email,
                    "resetCode": reset_code,
                    "expiresAt": pr.expires_at.isoformat().replace("+00:00", "Z"),
                },
                status=200,
            )

        except _ApiError as e:
            return _json_error(e.code, e.status)


@method_decorator(csrf_exempt, name="dispatch")
class ConfirmPasswordResetView(View):
    def post(self, request):
        try:
            body = _parse_body(request)
            email = (body.get("email") or "").strip().lower()
            reset_code = (body.get("resetCode") or "").strip()
            new_password = body.get("newPassword") or ""

            if not email:
                return _json_error("AUTH_EMAIL_REQUIRED")
            if not EMAIL_RE.match(email):
                return _json_error("AUTH_EMAIL_INVALID")
            if not reset_code:
                return _json_error("AUTH_RESET_CODE_REQUIRED")
            if not new_password:
                return _json_error("AUTH_PASSWORD_REQUIRED")
            if len(new_password) < 8:
                return _json_error("AUTH_PASSWORD_TOO_SHORT")

            try:
                pr = PasswordReset.objects.get(email=email)
            except PasswordReset.DoesNotExist:
                return _json_error("AUTH_RESET_NOT_REQUESTED")

            if pr.is_expired:
                return _json_error("AUTH_RESET_EXPIRED")

            if not pr.check_code(reset_code):
                return _json_error("AUTH_RESET_CODE_INVALID")

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return _json_error("AUTH_USER_NOT_FOUND", 404)

            user.set_password(new_password)
            user.save()

            # Remove the used reset and invalidate all sessions
            pr.delete()
            Session.objects.filter(user=user).delete()

            return HttpResponse(status=204)

        except _ApiError as e:
            return _json_error(e.code, e.status)
