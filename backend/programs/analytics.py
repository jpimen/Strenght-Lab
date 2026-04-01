from __future__ import annotations

from collections import defaultdict
from datetime import timedelta

from django.utils import timezone

from .models import Program, SetLog, TrainingSession


def _volume_kg(log: SetLog) -> float:
    return float(log.weight or 0) * float(log.reps or 0)


def _estimated_1rm(log: SetLog) -> float:
    weight = float(log.weight or 0)
    reps = int(log.reps or 0)
    if weight <= 0 or reps <= 0:
        return 0.0
    return weight * (1 + (min(reps, 12) / 30))


def _movement_bucket(exercise_name: str) -> str:
    name = exercise_name.upper()
    if any(token in name for token in ("SQUAT", "LUNGE", "LEG PRESS", "SPLIT SQUAT")):
        return "SQUAT_VARIATIONS"
    if any(token in name for token in ("DEADLIFT", "RDL", "HINGE", "GOOD MORNING", "HIP THRUST", "PULL")):
        return "HINGE_PATTERNS"
    if any(token in name for token in ("BENCH", "PRESS", "PUSH", "DIP")):
        return "PUSH_HORIZONTAL"
    return "ACCESSORY_LOAD"


def _lift_bucket(exercise_name: str) -> str | None:
    name = exercise_name.upper()
    if "SQUAT" in name:
        return "SQ"
    if "BENCH" in name or "PRESS" in name:
        return "BP"
    if "DEADLIFT" in name or "RDL" in name:
        return "DL"
    return None


def _program_status(completed_weeks: int, duration_weeks: int, recent_rpe: float | None) -> str:
    if recent_rpe is not None and recent_rpe >= 8.75:
        return "PEAK_WEEK"
    if completed_weeks <= 1:
        return "CALIBRATING"
    if duration_weeks and completed_weeks >= duration_weeks:
        return "PEAK_WEEK"
    return "ACTIVE"


def _display_athlete_name(program: Program, sessions: list[TrainingSession]) -> str:
    if program.athlete_name.strip():
        return program.athlete_name.strip().upper()
    if sessions:
        return sessions[-1].user.full_name.strip().upper()
    return "UNASSIGNED"


def _format_timestamp(value) -> str:
    if not value:
        return "N/A"
    local_value = timezone.localtime(value) if timezone.is_aware(value) else value
    return local_value.strftime("%Y.%m.%d // %H:%M:%S")


def _format_target_date(value) -> str:
    return f"{value.strftime('%Y.%m.%d')} // INFERRED"


def _week_key(date_value) -> tuple[int, int]:
    iso = date_value.isocalendar()
    return iso.year, iso.week


def _load_coach_activity(user):
    programs = list(
        Program.objects.filter(created_by=user)
        .order_by("-updated_at")
    )
    sessions = list(
        TrainingSession.objects.filter(program__created_by=user)
        .select_related("user", "program")
        .order_by("date", "start_time")
    )
    logs = list(
        SetLog.objects.filter(session__program__created_by=user)
        .select_related("session", "session__program", "session__user")
        .order_by("created_at")
    )

    program_sessions: dict[str, list[TrainingSession]] = defaultdict(list)
    athlete_sessions: dict[str, list[TrainingSession]] = defaultdict(list)
    for session in sessions:
        program_sessions[str(session.program_id)].append(session)
        athlete_sessions[str(session.user_id)].append(session)

    program_logs: dict[str, list[SetLog]] = defaultdict(list)
    athlete_logs: dict[str, list[SetLog]] = defaultdict(list)
    for log in logs:
        program_logs[str(log.session.program_id)].append(log)
        athlete_logs[str(log.session.user_id)].append(log)

    return {
        "programs": programs,
        "sessions": sessions,
        "logs": logs,
        "program_sessions": program_sessions,
        "athlete_sessions": athlete_sessions,
        "program_logs": program_logs,
        "athlete_logs": athlete_logs,
    }


def build_dashboard_payload(user) -> dict:
    dataset = _load_coach_activity(user)
    programs: list[Program] = dataset["programs"]
    sessions: list[TrainingSession] = dataset["sessions"]
    logs: list[SetLog] = dataset["logs"]
    program_sessions: dict[str, list[TrainingSession]] = dataset["program_sessions"]
    program_logs: dict[str, list[SetLog]] = dataset["program_logs"]

    now = timezone.now()
    last_7_days = now - timedelta(days=7)
    last_14_days = now - timedelta(days=14)

    athlete_names = {
        p.athlete_name.strip().upper()
        for p in programs
        if p.athlete_name.strip()
    }
    athlete_names.update(
        session.user.full_name.strip().upper()
        for session in sessions
        if session.user.full_name.strip()
    )

    recent_sessions = [session for session in sessions if session.start_time >= last_7_days]
    previous_sessions = [
        session
        for session in sessions
        if last_14_days <= session.start_time < last_7_days
    ]

    live_protocols = []
    for program in programs[:3]:
        attached_sessions = program_sessions.get(str(program.id), [])
        attached_logs = program_logs.get(str(program.id), [])
        completed_weeks = len({_week_key(session.date) for session in attached_sessions})

        recent_rpe_values = [
            float(log.rpe)
            for log in attached_logs
            if log.rpe is not None and log.created_at >= last_14_days
        ]
        avg_recent_rpe = (
            sum(recent_rpe_values) / len(recent_rpe_values)
            if recent_rpe_values
            else None
        )

        progress_percent = 0
        if program.duration_weeks > 0:
            progress_percent = min(
                100,
                round((completed_weeks / program.duration_weeks) * 100),
            )

        last_date = attached_sessions[-1].date if attached_sessions else timezone.localdate(program.updated_at)
        next_target = last_date + timedelta(days=2)

        live_protocols.append(
            {
                "id": str(program.id),
                "athleteName": _display_athlete_name(program, attached_sessions),
                "status": _program_status(completed_weeks, program.duration_weeks, avg_recent_rpe),
                "protocolName": program.name.strip().upper(),
                "progressText": f"WEEK {min(completed_weeks, max(program.duration_weeks, 0)):02d} / {max(program.duration_weeks, 0):02d}",
                "progressPercent": progress_percent,
                "nextSession": _format_target_date(next_target),
            }
        )

    recent_protocols = []
    status_map = {
        "PUBLISHED": "DEPLOYED",
        "CREATED": "STAGED",
        "DRAFT": "ARCHIVE",
    }
    for program in programs[:4]:
        recent_protocols.append(
            {
                "id": str(program.id),
                "protocolId": f"#{program.share_code}",
                "programName": program.name,
                "modifiedBy": user.full_name,
                "timestamp": _format_timestamp(program.updated_at),
                "status": status_map.get(program.status, "STAGED"),
            }
        )

    total_tonnage = round(sum(_volume_kg(log) for log in logs))
    week_totals: dict[tuple[int, int], float] = defaultdict(float)
    for log in logs:
        week_totals[_week_key(log.session.date)] += _volume_kg(log)
    sorted_week_totals = [round(value) for _, value in sorted(week_totals.items())[-6:]]

    alerts = []
    if logs:
        highest_rpe_log = max(
            (log for log in logs if log.rpe is not None),
            key=lambda log: float(log.rpe),
            default=None,
        )
        if highest_rpe_log and float(highest_rpe_log.rpe or 0) >= 9:
            alerts.append(
                {
                    "id": f"rpe-{highest_rpe_log.id}",
                    "type": "WARNING",
                    "title": "HIGH INTENSITY DETECTED",
                    "message": (
                        f"{highest_rpe_log.session.user.full_name.upper()} reached "
                        f"RPE {float(highest_rpe_log.rpe):.1f} on {highest_rpe_log.exercise_name.upper()}"
                    ),
                    "meta": {
                        "PROGRAM": highest_rpe_log.session.program.name.upper(),
                        "DAY": highest_rpe_log.session.date.isoformat(),
                        "LOAD_KG": f"{highest_rpe_log.weight:.1f}",
                    },
                }
            )

        pr_count = build_analytics_payload(user, dataset)["metrics"]["newPrsRecorded"]
        alerts.append(
            {
                "id": "activity-summary",
                "type": "SUCCESS" if pr_count > 0 else "INFO",
                "title": "SESSION INGEST COMPLETE" if pr_count > 0 else "ACTIVITY ONLINE",
                "message": (
                    f"{pr_count} new performance peaks detected across tracked athletes"
                    if pr_count > 0
                    else f"{len(recent_sessions)} sessions logged in the last 7 days"
                ),
                "timestamp": f"{len(recent_sessions)} IN LAST_7_DAYS",
            }
        )
    else:
        alerts.append(
            {
                "id": "no-logs",
                "type": "INFO",
                "title": "WAITING FOR ATHLETE INPUT",
                "message": "Programs are assigned, but no completed session logs have been recorded yet.",
                "timestamp": "NO_SESSION_DATA",
            }
        )

    return {
        "stats": {
            "activeCount": len(athlete_names),
            "uptimeChange": len(recent_sessions) - len(previous_sessions),
        },
        "liveProtocols": live_protocols,
        "recentProtocols": recent_protocols,
        "tonnageLoad": {
            "currentTotal": total_tonnage,
            "unit": "KG",
            "history": sorted_week_totals or [0, 0, 0, 0, 0, 0],
        },
        "alerts": alerts[:3],
    }


def build_analytics_payload(user, dataset: dict | None = None) -> dict:
    if dataset is None:
        dataset = _load_coach_activity(user)

    programs: list[Program] = dataset["programs"]
    sessions: list[TrainingSession] = dataset["sessions"]
    logs: list[SetLog] = dataset["logs"]
    athlete_sessions: dict[str, list[TrainingSession]] = dataset["athlete_sessions"]

    total_tonnage = sum(_volume_kg(log) for log in logs)
    rpe_values = [float(log.rpe) for log in logs if log.rpe is not None]
    avg_rpe = sum(rpe_values) / len(rpe_values) if rpe_values else 0.0

    athlete_names = {
        p.athlete_name.strip().upper()
        for p in programs
        if p.athlete_name.strip()
    }
    athlete_names.update(
        session.user.full_name.strip().upper()
        for session in sessions
        if session.user.full_name.strip()
    )

    prior_best: dict[tuple[str, str], float] = defaultdict(float)
    pr_count = 0
    for log in logs:
        athlete_key = str(log.session.user_id)
        exercise_key = log.exercise_name.strip().upper()
        estimate = _estimated_1rm(log)
        key = (athlete_key, exercise_key)
        if estimate > 0 and estimate > prior_best[key] + 0.01:
            if prior_best[key] > 0:
                pr_count += 1
            prior_best[key] = estimate

    week_labels = []
    current_monday = timezone.localdate() - timedelta(days=timezone.localdate().weekday())
    for offset in range(11, -1, -1):
        week_start = current_monday - timedelta(weeks=offset)
        week_labels.append(week_start)

    trajectory_data = []
    peak_score = 0.0
    peak_index = -1
    for index, week_start in enumerate(week_labels, start=1):
        week_end = week_start + timedelta(days=7)
        lifts = {"SQ": 0.0, "BP": 0.0, "DL": 0.0}
        for log in logs:
            if not (week_start <= log.session.date < week_end):
                continue
            bucket = _lift_bucket(log.exercise_name)
            if not bucket:
                continue
            lifts[bucket] = max(lifts[bucket], _estimated_1rm(log))
        combined = lifts["SQ"] + lifts["BP"] + lifts["DL"]
        if combined >= peak_score:
            peak_score = combined
            peak_index = index
        trajectory_data.append(
            {
                "name": f"WK_{index:02d}",
                "SQ": round(lifts["SQ"]),
                "BP": round(lifts["BP"]),
                "DL": round(lifts["DL"]),
            }
        )
    if 0 <= peak_index - 1 < len(trajectory_data):
        trajectory_data[peak_index - 1]["isPeak"] = True

    movement_totals = defaultdict(float)
    total_reps = 0.0
    for log in logs:
        reps = float(log.reps or 0)
        movement_totals[_movement_bucket(log.exercise_name)] += reps
        total_reps += reps

    movement_order = [
        ("SQUAT_VARIATIONS", "#dc2626"),
        ("HINGE_PATTERNS", "#111111"),
        ("PUSH_HORIZONTAL", "#6b7280"),
        ("ACCESSORY_LOAD", "#9ca3af"),
    ]
    movement_distribution = []
    for name, color in movement_order:
        value = movement_totals[name]
        percent = round((value / total_reps) * 100) if total_reps else 0
        movement_distribution.append(
            {
                "name": name,
                "value": percent,
                "color": color,
            }
        )

    program_lookup = {}
    for program in programs:
        athlete_name = program.athlete_name.strip().upper()
        if athlete_name:
            program_lookup[athlete_name] = program.name.upper()

    reference_monday = timezone.localdate() - timedelta(days=timezone.localdate().weekday())
    athlete_consistency = []
    for athlete_id, attached_sessions in athlete_sessions.items():
        latest_session = attached_sessions[-1]
        athlete_name = latest_session.user.full_name.strip().upper()
        consistency = []
        completed = 0
        for offset in range(4, -1, -1):
            week_start = reference_monday - timedelta(weeks=offset)
            week_end = week_start + timedelta(days=7)
            has_session = any(week_start <= session.date < week_end for session in attached_sessions)
            consistency.append("red" if has_session else "gray")
            if has_session:
                completed += 1

        athlete_consistency.append(
            {
                "athleteId": athlete_id,
                "name": athlete_name,
                "program": program_lookup.get(athlete_name, latest_session.program.name.upper()),
                "consistency": consistency,
                "completed": completed,
            }
        )

    athlete_consistency.sort(
        key=lambda item: (-item["completed"], item["name"])
    )
    top_consistency = [
        {
            "rank": f"{index:02d}",
            "name": item["name"],
            "program": item["program"],
            "consistency": item["consistency"],
        }
        for index, item in enumerate(athlete_consistency[:5], start=1)
    ]

    return {
        "metrics": {
            "totalTonnageKg": round(total_tonnage),
            "avgSessionRpe": round(avg_rpe, 1),
            "newPrsRecorded": pr_count,
            "activeAthletes": len(athlete_names),
        },
        "trajectoryData": trajectory_data,
        "movementDistribution": movement_distribution,
        "athleteConsistency": top_consistency,
    }
