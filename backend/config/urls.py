"""Root URL configuration."""

from django.urls import path, include

urlpatterns = [
    path("api/auth/", include("authentication.urls")),
    path("api/programs/", include("programs.urls")),
]
