"""
Program models.

A Program is a training plan created by a coach in the frontend
Program Builder.  When published, a unique 6-character share code
is generated so athletes can fetch it on the mobile app.
"""

import random
import string
import uuid

from django.db import models
from django.utils import timezone

from authentication.models import User


def _generate_share_code() -> str:
    """Generate a unique 6-character uppercase alphanumeric code."""
    chars = string.ascii_uppercase + string.digits
    # Remove ambiguous characters (O, 0, I, 1, L)
    chars = chars.replace("O", "").replace("0", "").replace("I", "").replace("1", "").replace("L", "")
    return "".join(random.choices(chars, k=6))


class Program(models.Model):
    """A published training program with a shareable code."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    share_code = models.CharField(max_length=6, unique=True, db_index=True)

    # Meta info
    name = models.CharField(max_length=255)
    athlete_name = models.CharField(max_length=255, blank=True, default="")
    goal = models.CharField(max_length=255, blank=True, default="")
    duration_weeks = models.PositiveIntegerField(default=4)
    status = models.CharField(
        max_length=20,
        choices=[("DRAFT", "Draft"), ("CREATED", "Created"), ("PUBLISHED", "Published")],
        default="PUBLISHED",
    )

    # The full program builder state (cells, columns, variables, rowLabels)
    builder_data = models.JSONField(default=dict, help_text="Full ProgramBuilderSnapshot from frontend")

    # Ownership
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="programs",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "programs_program"
        ordering = ["-updated_at"]

    def save(self, *args, **kwargs):
        if not self.share_code:
            # Keep trying until we get a unique code
            for _ in range(100):
                code = _generate_share_code()
                if not Program.objects.filter(share_code=code).exists():
                    self.share_code = code
                    break
            else:
                raise RuntimeError("Could not generate a unique share code")
        super().save(*args, **kwargs)

    def to_dict(self) -> dict:
        """Serialize for API responses."""
        return {
            "id": str(self.id),
            "shareCode": self.share_code,
            "name": self.name,
            "athleteName": self.athlete_name,
            "goal": self.goal,
            "durationWeeks": self.duration_weeks,
            "status": self.status,
            "builderData": self.builder_data,
            "createdBy": str(self.created_by_id) if self.created_by_id else None,
            "createdAt": self.created_at.isoformat().replace("+00:00", "Z"),
            "updatedAt": self.updated_at.isoformat().replace("+00:00", "Z"),
        }

    def to_summary(self) -> dict:
        """Lightweight summary without full builder data."""
        return {
            "id": str(self.id),
            "shareCode": self.share_code,
            "name": self.name,
            "athleteName": self.athlete_name,
            "goal": self.goal,
            "durationWeeks": self.duration_weeks,
            "status": self.status,
            "createdAt": self.created_at.isoformat().replace("+00:00", "Z"),
            "updatedAt": self.updated_at.isoformat().replace("+00:00", "Z"),
        }

    def to_mobile_dict(self) -> dict:
        """
        Flatten the program into a format the mobile app can consume
        directly — a list of TrainingLog-compatible exercise entries
        grouped by day.
        """
        builder = self.builder_data or {}
        cells = builder.get("cells", {})
        columns = builder.get("columns", [])
        row_labels = builder.get("rowLabels", {})

        # Build column-key → header mapping
        col_headers = {}
        for col in columns:
            key = col.get("key", "")
            header = col.get("header", key)
            col_headers[key] = header

        # Discover rows from cell keys  (format: "R{row}_{colKey}")
        rows_data: dict[int, dict[str, str]] = {}
        for cell_key, cell_val in cells.items():
            if "_" not in cell_key:
                continue
            parts = cell_key.split("_", 1)
            if not parts[0].startswith("R"):
                continue
            try:
                row_num = int(parts[0][1:])
            except ValueError:
                continue
            col_key = parts[1]
            resolved = cell_val.get("resolved", cell_val.get("raw", ""))
            rows_data.setdefault(row_num, {})[col_key] = resolved

        exercises = []
        for row_num in sorted(rows_data.keys()):
            row = rows_data[row_num]
            label = row_labels.get(str(row_num), f"R{row_num}")
            exercise_name = row.get("exercise", row.get("EXERCISE", ""))
            sets_raw = row.get("sets", row.get("SETS", "0"))
            reps_raw = row.get("reps", row.get("REPS", ""))
            intensity = row.get("intensity", row.get("INTENSITY", row.get("rpe", row.get("RPE", ""))))
            rest = row.get("rest", row.get("REST", ""))
            notes = row.get("notes", row.get("NOTES", ""))

            if not exercise_name.strip():
                continue

            try:
                sets_int = int(float(sets_raw)) if sets_raw else 0
            except (ValueError, TypeError):
                sets_int = 0

            exercises.append({
                "day": label,
                "exerciseName": exercise_name.strip(),
                "sets": sets_int,
                "reps": reps_raw.strip().upper() if reps_raw else "",
                "intensityRpe": intensity.strip() if intensity else "",
                "rest": rest.strip() if rest else "",
                "notes": notes.strip() if notes else "",
            })

        return {
            "id": str(self.id),
            "shareCode": self.share_code,
            "name": self.name,
            "athleteName": self.athlete_name,
            "goal": self.goal,
            "durationWeeks": self.duration_weeks,
            "status": self.status,
            "exercises": exercises,
            "createdAt": self.created_at.isoformat().replace("+00:00", "Z"),
            "updatedAt": self.updated_at.isoformat().replace("+00:00", "Z"),
        }

    def __str__(self) -> str:
        return f"{self.name} [{self.share_code}]"

class TrainingSession(models.Model):
    """A single workout performed by an athlete, linked to a Program."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name="sessions")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="training_sessions")
    
    date = models.DateField(default=timezone.now)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    
    notes = models.TextField(blank=True, default="")
    total_volume = models.FloatField(default=0.0, help_text="Auto-calculated sum of all sets (weight * reps)")

    class Meta:
        db_table = "programs_training_session"
        ordering = ["-date", "-start_time"]

    def __str__(self):
        return f"Session {self.date} - {self.user.full_name}"

class SetLog(models.Model):
    """A single set recorded within a TrainingSession."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(TrainingSession, on_delete=models.CASCADE, related_name="sets")
    exercise_name = models.CharField(max_length=255)
    
    set_number = models.PositiveIntegerField()
    weight = models.FloatField(default=0.0)
    reps = models.PositiveIntegerField(default=0)
    rpe = models.FloatField(null=True, blank=True)
    
    is_pr = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "programs_set_log"
        ordering = ["created_at"]

class DailyReadiness(models.Model):
    """Morning readiness tracking for athletes (fatigue monitoring)."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="readiness_logs")
    date = models.DateField(default=timezone.now)
    
    sleep_quality = models.PositiveIntegerField(help_text="1-10 scale")
    soreness = models.PositiveIntegerField(help_text="1-10 scale")
    stress = models.PositiveIntegerField(help_text="1-10 scale")
    energy = models.PositiveIntegerField(help_text="1-10 scale")
    
    weight_kg = models.FloatField(null=True, blank=True)
    notes = models.TextField(blank=True, default="")

    class Meta:
        db_table = "programs_daily_readiness"
        unique_together = ["user", "date"]
