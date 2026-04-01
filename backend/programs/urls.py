"""Program URL patterns."""

from django.urls import path
from . import views

urlpatterns = [
    path("create", views.ProgramCreateView.as_view(), name="program-create"),
    path("analytics/dashboard", views.DashboardAnalyticsView.as_view(), name="analytics-dashboard"),
    path("analytics/overview", views.AnalyticsOverviewView.as_view(), name="analytics-overview"),
    path("<program_id>", views.ProgramDetailView.as_view(), name="program-detail"),
    path("fetch/<code>", views.ProgramFetchView.as_view(), name="program-fetch"),
    path("list", views.ProgramListView.as_view(), name="program-list"),
]
