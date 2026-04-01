"""
Program API views.

Endpoints:
  POST /api/programs/create       - Create/Publish a program and get a share code
  GET  /api/programs/fetch/<code> - Fetch program by share code (Mobile)
  GET  /api/programs/list         - List coach's programs
"""

import json
from django.db import models
from django.http import JsonResponse, HttpResponse
from django.views import View
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from authentication.models import User, Session
from .analytics import build_analytics_payload, build_dashboard_payload
from .models import Program, Cycle, TrainingSession, SetLog

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _json_error(code: str, status: int = 400) -> JsonResponse:
    # Match original Node response format if possible, but Django usually wraps in dict
    return JsonResponse({"code": code}, status=status)

def _get_bearer_token(request) -> str | None:
    auth = request.META.get("HTTP_AUTHORIZATION", "")
    if auth.startswith("Bearer "):
        token = auth[7:].strip()
        return token or None
    return None

def _get_user_from_request(request) -> User | None:
    # For now, if no auth provided, return None.  (The mobile app might not send it yet)
    token = _get_bearer_token(request)
    if not token:
        return None
    try:
        session = Session.objects.select_related("user").get(token=token)
        if session.is_expired:
            return None
        return session.user
    except Session.DoesNotExist:
        return None

# ---------------------------------------------------------------------------
# Views
# ---------------------------------------------------------------------------

@method_decorator(csrf_exempt, name="dispatch")
class ProgramCreateView(View):
    def post(self, request):
        user = _get_user_from_request(request)
        try:
            body = json.loads(request.body)
        except (json.JSONDecodeError, UnicodeDecodeError):
            return _json_error("INVALID_REQUEST", 400)

        name = body.get("name", "Untitled Program")
        athlete_name = body.get("athleteName", "")
        goal = body.get("goal", "")
        duration_weeks = body.get("durationWeeks", 4)
        status = body.get("status", "PUBLISHED")
        builder_data = body.get("builderData", {})

        program = Program.objects.create(
            name=name,
            athlete_name=athlete_name,
            goal=goal,
            duration_weeks=duration_weeks,
            status=status,
            builder_data=builder_data,
            created_by=user
        )

        return JsonResponse(program.to_dict(), status=201)

@method_decorator(csrf_exempt, name="dispatch")
class ProgramFetchView(View):
    def get(self, request, code):
        code = code.upper().strip()
        try:
            program = Program.objects.get(share_code=code)
            return JsonResponse(program.to_mobile_dict(), status=200)
        except Program.DoesNotExist:
            return _json_error("PROGRAM_NOT_FOUND", 404)

@method_decorator(csrf_exempt, name="dispatch")
class ProgramListView(View):
    def get(self, request):
        user = _get_user_from_request(request)
        if not user:
            return _json_error("UNAUTHORIZED", 401)
            
        programs = Program.objects.filter(created_by=user)
        return JsonResponse([p.to_summary() for p in programs], safe=False)

@method_decorator(csrf_exempt, name="dispatch")
class ProgramDetailView(View):
    def get(self, request, program_id):
        user = _get_user_from_request(request)
        if not user:
            return _json_error("UNAUTHORIZED", 401)

        try:
            program = Program.objects.get(id=program_id, created_by=user)
            return JsonResponse(program.to_dict(), status=200)
        except Program.DoesNotExist:
            return _json_error("PROGRAM_NOT_FOUND", 404)

    def put(self, request, program_id):
        user = _get_user_from_request(request)
        if not user:
            return _json_error("UNAUTHORIZED", 401)

        try:
            program = Program.objects.get(id=program_id, created_by=user)
        except Program.DoesNotExist:
            return _json_error("PROGRAM_NOT_FOUND", 404)

        try:
            body = json.loads(request.body)
        except (json.JSONDecodeError, UnicodeDecodeError):
            return _json_error("INVALID_REQUEST", 400)

        program.name = body.get("name", program.name)
        program.athlete_name = body.get("athleteName", program.athlete_name)
        program.goal = body.get("goal", program.goal)
        program.duration_weeks = int(body.get("durationWeeks", program.duration_weeks) or program.duration_weeks)
        program.status = body.get("status", program.status).upper() if body.get("status") else program.status
        program.builder_data = body.get("builderData", program.builder_data)
        program.save()

        return JsonResponse(program.to_dict(), status=200)


@method_decorator(csrf_exempt, name="dispatch")
class DashboardAnalyticsView(View):
    def get(self, request):
        user = _get_user_from_request(request)
        if not user:
            return _json_error("UNAUTHORIZED", 401)

        return JsonResponse(build_dashboard_payload(user), status=200)


@method_decorator(csrf_exempt, name="dispatch")
class AnalyticsOverviewView(View):
    def get(self, request):
        user = _get_user_from_request(request)
        if not user:
            return _json_error("UNAUTHORIZED", 401)

        return JsonResponse(build_analytics_payload(user), status=200)

# ---- Compatibility views for Mobile ----

@method_decorator(csrf_exempt, name="dispatch")
class CycleListView(View):
    def get(self, request):
        user = _get_user_from_request(request)
        # If no user, return empty or dummy for now to avoid crash
        if not user:
            return JsonResponse([], safe=False)
            
        cycles = Cycle.objects.filter(user=user)
        return JsonResponse([c.to_dict() for c in cycles], safe=False)

@method_decorator(csrf_exempt, name="dispatch")
class TrainingLogCompatView(View):
    """
    Handles /api/training-logs.
    The mobile app expects a flat list of workout rows.
    """

    def _serialize_log(self, log: SetLog):
        session = log.session
        day_label = f"D{session.date.isoweekday()}" if session and session.date else "D1"
        return {
            "id": str(log.id),
            "day": day_label,
            "exerciseName": log.exercise_name,
            "sets": log.set_number,
            "reps": str(log.reps),
            "rpe": log.rpe if log.rpe is not None else 0,
            "cycleId": str(session.program_id) if session and session.program_id else None,
            "createdAt": log.created_at.isoformat().replace("+00:00", "Z"),
        }

    def _get_filtered_logs(self, user, params):
        logs = SetLog.objects.filter(session__user=user).select_related("session", "session__program")

        cycle = params.get("cycle")
        if cycle:
            logs = logs.filter(
                models.Q(session__program__id=cycle) |
                models.Q(session__program__share_code__iexact=cycle)
            )

        day = params.get("day")
        if day:
            day_value = day.strip().upper()
            if day_value.startswith("D"):
                try:
                    day_number = int(day_value[1:])
                    # Django weekday 1=Sunday, while D1..D7 in mobile is usually Mon-Sun
                    # We'll map D1->Monday (isoweekday 1) as best-effort.
                    logs = logs.filter(session__date__week_day=((day_number % 7) + 1))
                except (ValueError, TypeError):
                    pass
            else:
                try:
                    date_value = timezone.datetime.fromisoformat(day_value).date()
                    logs = logs.filter(session__date=date_value)
                except (ValueError, TypeError):
                    pass

        exercise = params.get("exercise")
        if exercise:
            logs = logs.filter(exercise_name__icontains=exercise)

        sort_by = params.get("sortBy", "day").lower()
        sort_order = params.get("sortOrder", "asc").lower()

        ordering = "session__date" if sort_by == "day" else "exercise_name" if sort_by == "exercise" else "created_at"
        if sort_order == "desc":
            ordering = f"-{ordering}"

        return logs.order_by(ordering)

    def get(self, request, log_id=None):
        user = _get_user_from_request(request)
        if not user:
            return JsonResponse([], safe=False)

        if log_id:
            try:
                log = SetLog.objects.select_related("session").get(id=log_id, session__user=user)
                return JsonResponse(self._serialize_log(log), status=200)
            except SetLog.DoesNotExist:
                return _json_error("TRAINING_LOG_NOT_FOUND", 404)

        logs = self._get_filtered_logs(user, request.GET)
        results = [self._serialize_log(log) for log in logs]
        return JsonResponse(results, safe=False)

    def post(self, request, log_id=None):
        user = _get_user_from_request(request)
        if not user:
            return _json_error("UNAUTHORIZED", 401)

        try:
            body = json.loads(request.body)
        except (json.JSONDecodeError, UnicodeDecodeError):
            return _json_error("INVALID_JSON", 400)

        exercise_name = str(body.get("exerciseName") or body.get("exercise") or "").strip()
        if not exercise_name:
            return _json_error("INVALID_EXERCISE_NAME", 400)

        sets = int(body.get("sets", 1) or 1)
        reps_raw = str(body.get("reps", "0")).strip()
        rpe = body.get("intensityRpe", body.get("rpe", 0))
        try:
            rpe = float(rpe) if rpe not in (None, "") else None
        except (ValueError, TypeError):
            rpe = None

        weight = body.get("weight", 0.0)
        try:
            weight = float(weight)
        except (ValueError, TypeError):
            weight = 0.0

        # Determine program / session association
        cycle_id = body.get("cycleId")
        program = None
        if cycle_id:
            program = Program.objects.filter(models.Q(id=cycle_id) | models.Q(share_code__iexact=cycle_id)).first()

        if not program:
            program = Program.objects.filter(created_by=user).order_by("-updated_at").first()

        if not program:
            return _json_error("PROGRAM_NOT_FOUND", 404)

        day_param = body.get("day")
        session_date = timezone.now().date()
        if day_param and isinstance(day_param, str):
            try:
                session_date = timezone.datetime.fromisoformat(day_param).date()
            except ValueError:
                pass

        session, _ = TrainingSession.objects.get_or_create(
            user=user,
            program=program,
            date=session_date,
            defaults={"notes": "", "total_volume": 0.0},
        )

        reps = 0
        if reps_raw.strip().upper() != "AMRAP":
            try:
                reps = int(float(reps_raw))
            except ValueError:
                reps = 0

        log = SetLog.objects.create(
            session=session,
            exercise_name=exercise_name,
            set_number=sets,
            weight=weight,
            reps=reps,
            rpe=rpe,
        )

        return JsonResponse(self._serialize_log(log), status=201)

    def put(self, request, log_id=None):
        user = _get_user_from_request(request)
        if not user:
            return _json_error("UNAUTHORIZED", 401)

        if not log_id:
            return _json_error("MISSING_ID", 400)

        try:
            log = SetLog.objects.select_related("session").get(id=log_id, session__user=user)
        except SetLog.DoesNotExist:
            return _json_error("TRAINING_LOG_NOT_FOUND", 404)

        try:
            body = json.loads(request.body)
        except (json.JSONDecodeError, UnicodeDecodeError):
            return _json_error("INVALID_JSON", 400)

        exercise_name = body.get("exerciseName") or body.get("exercise")
        if exercise_name is not None:
            log.exercise_name = str(exercise_name)

        if body.get("sets") is not None:
            try:
                log.set_number = int(body.get("sets", log.set_number))
            except (TypeError, ValueError):
                pass

        if body.get("reps") is not None:
            reps_raw = str(body.get("reps", "0")).strip()
            if reps_raw.upper() == "AMRAP":
                log.reps = 0
            else:
                try:
                    log.reps = int(float(reps_raw))
                except (ValueError, TypeError):
                    pass

        if body.get("intensityRpe") is not None:
            try:
                log.rpe = float(body.get("intensityRpe"))
            except (ValueError, TypeError):
                pass

        if body.get("weight") is not None:
            try:
                log.weight = float(body.get("weight"))
            except (ValueError, TypeError):
                pass

        log.save()
        return JsonResponse(self._serialize_log(log), status=200)

    def delete(self, request, log_id=None):
        user = _get_user_from_request(request)
        if not user:
            return _json_error("UNAUTHORIZED", 401)

        if not log_id:
            return _json_error("MISSING_ID", 400)

        try:
            log = SetLog.objects.get(id=log_id, session__user=user)
            log.delete()
            return HttpResponse(status=204)
        except SetLog.DoesNotExist:
            return _json_error("TRAINING_LOG_NOT_FOUND", 404)
