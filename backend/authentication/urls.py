"""Authentication URL patterns."""

from django.urls import path
from . import views

urlpatterns = [
    path("signup", views.SignUpView.as_view(), name="auth-signup"),
    path("login", views.LogInView.as_view(), name="auth-login"),
    path("session", views.SessionView.as_view(), name="auth-session"),
    path("logout", views.LogOutView.as_view(), name="auth-logout"),
    path(
        "password-reset/request",
        views.RequestPasswordResetView.as_view(),
        name="auth-password-reset-request",
    ),
    path(
        "password-reset/confirm",
        views.ConfirmPasswordResetView.as_view(),
        name="auth-password-reset-confirm",
    ),
]
