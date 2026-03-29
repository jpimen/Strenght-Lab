"""
Program API views.

Endpoints:
  POST /api/programs/create       - Create/Publish a program and get a share code
  GET  /api/programs/fetch/<code> - Fetch program by share code (Mobile)
  GET  /api/programs/list         - List coach's programs
"""

import json
from django.http import JsonResponse, HttpResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from authentication.models import User, Session
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
    def get(self, request):
        user = _get_user_from_request(request)
        # Mobile app also supports query params like ?sortBy=day&sortOrder=asc
        sort_by = request.GET.get("sortBy", "day")
        sort_order = request.GET.get("sortOrder", "asc")
        
        # For now, return what we have in TrainingSession/SetLog
        if not user:
            # Seed default data if no user matched to make the UI look alive
            return JsonResponse([], safe=False)
            
        # This is a simplification: mobile expects TrainingLog rows.
        # We'll map our SetLogs to this format.
        logs = SetLog.objects.filter(session__user=user)
        
        # Basic mapping to the mobile TrainingLog.fromJson expectation
        results = []
        for log in logs:
            results.append({
                "id": str(log.id),
                "day": "D1", # Need to fix mapping based on TrainingSession metadata
                "exerciseName": log.exercise_name,
                "sets": 1, 
                "reps": str(log.reps),
                "rpe": log.rpe,
                "createdAt": log.created_at.isoformat()
            })
            
        return JsonResponse(results, safe=False)

    def post(self, request):
        # Handle creating a log from mobile
        user = _get_user_from_request(request)
        if not user:
            return _json_error("UNAUTHORIZED", 401)
            
        try:
            body = json.loads(request.body)
        except (json.JSONDecodeError, UnicodeDecodeError):
            return _json_error("INVALID_JSON", 400)
            
        # Create a dummy session or link to a program
        # For compatibility speed, let's just save the log.
        # In a real app, we'd need to find/create the today session.
        return JsonResponse({"status": "TODO"}, status=201)
