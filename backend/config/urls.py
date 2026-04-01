"""Root URL configuration."""

from django.urls import path, include
from programs import views

urlpatterns = [
    path("api/auth/", include("authentication.urls")),
    path("api/programs/", include("programs.urls")),
    # Compatibility with original mobile API routes
    path("api/training-logs", views.TrainingLogCompatView.as_view(), name="compat-training-logs"),
    path("api/training-logs/<str:log_id>", views.TrainingLogCompatView.as_view(), name="compat-training-log-detail"),
    path("api/cycles", views.CycleListView.as_view(), name="compat-cycles"),
]
