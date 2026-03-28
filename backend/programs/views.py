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
from .models import Program

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _json_error(code: str, status: int = 400) -> JsonResponse:
    return JsonResponse({"code": code}, status=status)

def _get_bearer_token(request) -> str | None:
    auth = request.META.get("HTTP_AUTHORIZATION", "")
    if auth.startswith("Bearer "):
        token = auth[7:].strip()
        return token or None
    return None

def _get_user_from_request(request) -> User | None:
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
        # We don't strictly enforce auth for creation if we want to allow guests,
        # but typically we'd want a coach to be logged in.
        
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
            # Mobile app usually wants the flattened format
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
