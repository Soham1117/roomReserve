from django.db import models
from django.contrib.auth.models import User
from booking_service.models import Booking # Assuming Booking is in booking_service app

# Create your models here.

class NotificationType(models.Model):
    """
    Represents the type of notification sent.
    Corresponds to the 'notification_types' table.
    """
    type_code = models.CharField(max_length=50, primary_key=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.type_code

    # Meta class removed for db_table

class NotificationLog(models.Model):
    """
    Logs notifications sent to users.
    Corresponds to the 'notification_log' table.
    """
    # Django automatically adds an 'id' field
    user = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True) # Keep log even if user deleted
    booking = models.ForeignKey(Booking, on_delete=models.SET_NULL, blank=True, null=True) # Keep log even if booking deleted
    notification_type = models.ForeignKey(NotificationType, on_delete=models.PROTECT) # Don't delete log if type deleted
    channel = models.CharField(max_length=20, null=False) # e.g., 'EMAIL', 'SMS'
    recipient = models.CharField(max_length=255, null=False) # e.g., email address, phone number
    subject = models.CharField(max_length=255, blank=True, null=True) # For email
    content = models.TextField(null=False)
    status = models.CharField(max_length=20, null=False) # e.g., 'SENT', 'FAILED', 'PENDING'
    sent_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.notification_type} to {self.recipient} ({self.status}) at {self.created_at}"

    class Meta:
        # db_table = 'notification_log' # Removed
        verbose_name_plural = "Notification Logs"
