from django.db import models
import uuid
from authentication.models import User

class Conversation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # A simple room where a coach and athlete talk.
    # In a more complex gym, this could be a 'Training Room'.
    participants = models.ManyToManyField(User, related_name="conversations")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "communication_conversation"

    def __str__(self):
        # Shows first two participants as a summary
        parts = self.participants.all()[:2]
        return f"Conversation between {', '.join([p.full_name for p in parts])}"

class Message(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_messages")
    body = models.TextField()
    
    # Message status
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "communication_message"
        ordering = ["created_at"]

    def is_read(self):
        return self.read_at is not None

class MessageAttachment(models.Model):
    FILE_TYPE_CHOICES = [
        ("IMAGE", "Image"),
        ("VIDEO", "Video"),
        ("FILE", "File"),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name="attachments")
    file_url = models.URLField()
    file_type = models.CharField(max_length=10, choices=FILE_TYPE_CHOICES, default="IMAGE")
    file_name = models.CharField(max_length=255, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "communication_attachment"
