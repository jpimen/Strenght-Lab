"""Program URL patterns."""

from django.urls import path
from . import views

urlpatterns = [
    path("create", views.ProgramCreateView.as_view(), name="program-create"),
    path("fetch/<code>", views.ProgramFetchView.as_view(), name="program-fetch"),
    path("list", views.ProgramListView.as_view(), name="program-list"),
]
