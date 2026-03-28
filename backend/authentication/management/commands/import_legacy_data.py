"""
Management command to import existing users & sessions from the legacy
Node.js JSON files into the Django database.

Usage:
    python manage.py import_legacy_data
"""

import json
from pathlib import Path
from datetime import datetime, timezone as tz

from django.core.management.base import BaseCommand
from django.conf import settings

from authentication.models import User, Session


class Command(BaseCommand):
    help = "Import users and sessions from legacy JSON data files."

    def handle(self, *args, **options):
        data_dir = Path(settings.BASE_DIR) / "data"

        # ---- Users ----
        users_file = data_dir / "users.json"
        if users_file.exists():
            users_data = json.loads(users_file.read_text(encoding="utf-8"))
            for u in users_data:
                if User.objects.filter(id=u["id"]).exists():
                    self.stdout.write(f"  Skipping existing user {u['email']}")
                    continue
                User.objects.create(
                    id=u["id"],
                    full_name=u["fullName"],
                    email=u["email"],
                    password_salt=u["passwordSalt"],
                    password_hash=u["passwordHash"],
                    created_at=datetime.fromisoformat(
                        u["createdAt"].replace("Z", "+00:00")
                    ),
                )
                self.stdout.write(self.style.SUCCESS(f"  Imported user {u['email']}"))
        else:
            self.stdout.write("  No users.json found — skipping.")

        # ---- Sessions ----
        sessions_file = data_dir / "sessions.json"
        if sessions_file.exists():
            sessions_data = json.loads(sessions_file.read_text(encoding="utf-8"))
            for s in sessions_data:
                if Session.objects.filter(token=s["token"]).exists():
                    self.stdout.write(f"  Skipping existing session {s['token']}")
                    continue
                try:
                    user = User.objects.get(id=s["userId"])
                except User.DoesNotExist:
                    self.stdout.write(
                        self.style.WARNING(
                            f"  Skipping session {s['token']} — user not found"
                        )
                    )
                    continue
                Session.objects.create(
                    token=s["token"],
                    user=user,
                    created_at=datetime.fromisoformat(
                        s["createdAt"].replace("Z", "+00:00")
                    ),
                    expires_at=datetime.fromisoformat(
                        s["expiresAt"].replace("Z", "+00:00")
                    ),
                )
                self.stdout.write(
                    self.style.SUCCESS(f"  Imported session {s['token'][:8]}…")
                )
        else:
            self.stdout.write("  No sessions.json found — skipping.")

        self.stdout.write(self.style.SUCCESS("\nLegacy data import complete."))
