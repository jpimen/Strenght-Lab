from django.db import models
import uuid

class Exercise(models.Model):
    """
    Inventory of exercises available for training programs.
    """
    CATEGORY_CHOICES = [
        ("COMPOUND", "Compound"),
        ("ISOLATION", "Isolation"),
        ("ACCESSORY", "Accessory"),
        ("CARDIO", "Cardio"),
        ("MOBILITY", "Mobility"),
    ]

    EQUIPMENT_CHOICES = [
        ("BARBELL", "Barbell"),
        ("DUMBBELL", "Dumbbell"),
        ("KETTLEBELL", "Kettlebell"),
        ("MACHINE", "Machine"),
        ("CABLE", "Cable"),
        ("BODYWEIGHT", "Bodyweight"),
        ("BANDS", "Bands"),
        ("OTHER", "Other"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True, db_index=True)
    slug = models.SlugField(max_length=255, unique=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default="COMPOUND")
    primary_muscle = models.CharField(max_length=100, db_index=True)
    secondary_muscles = models.JSONField(default=list, blank=True)
    equipment = models.CharField(max_length=20, choices=EQUIPMENT_CHOICES, default="BARBELL")
    
    # Details & Media
    description = models.TextField(blank=True, default="")
    video_url = models.URLField(blank=True, null=True, help_text="Link to a demo video")
    image_url = models.URLField(blank=True, null=True, help_text="Link to a movement diagram")
    
    # Flags
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "exercises_exercise"
        ordering = ["name"]

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "category": self.category,
            "primaryMuscle": self.primary_muscle,
            "secondaryMuscles": self.secondary_muscles,
            "equipment": self.equipment,
            "description": self.description,
            "videoUrl": self.video_url,
            "imageUrl": self.image_url,
            "isActive": self.is_active,
        }

    def __str__(self):
        return f"{self.name} ({self.category})"
