from rest_framework import viewsets, permissions
from .models import NotificationType, NotificationLog
from .serializers import NotificationTypeSerializer, NotificationLogSerializer

# Create your views here.

class NotificationTypeViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for viewing Notification Types."""
    queryset = NotificationType.objects.all()
    serializer_class = NotificationTypeSerializer
    permission_classes = [permissions.AllowAny] # Types are usually public

class NotificationLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for viewing Notification Logs.
    Typically read-only. Permissions should restrict access.
    """
    queryset = NotificationLog.objects.all().order_by('-created_at')
    serializer_class = NotificationLogSerializer
    permission_classes = [permissions.IsAdminUser] # Example: Only admins can see logs

    # Could add filtering by user if non-admins need to see their own notifications
    # def get_queryset(self):
    #     user = self.request.user
    #     if user.is_staff:
    #         return NotificationLog.objects.all().order_by('-created_at')
    #     return NotificationLog.objects.filter(user=user).order_by('-created_at')
