from django.urls import path
from . import views

# Since this file is included for BOTH training-logs and cycles routes,
# we have to be careful.  Better to split them or just define in config/urls.

# Actually, let's keep it simple in programs/urls.py or similar.
# For now, I'll provide views for both.
urlpatterns = [
    # Handled via include in config/urls.py
]
