from rest_framework import serializers
from .models import NotificationType, NotificationLog
# from user_service.serializers import UserSerializer # If nesting user details
# from booking_service.serializers import BookingSerializer # If nesting booking details

class NotificationTypeSerializer(serializers.ModelSerializer):
    """Serializer for the NotificationType model."""
    class Meta:
        model = NotificationType
        fields = ['type_code', 'description']

class NotificationLogSerializer(serializers.ModelSerializer):
    """Serializer for the NotificationLog model."""
    # Represent related fields by their string representation or nested serializer
    user = serializers.StringRelatedField(read_only=True) # Show username
    booking = serializers.StringRelatedField(read_only=True) # Show booking reference
    notification_type = serializers.SlugRelatedField(slug_field='type_code', queryset=NotificationType.objects.all())

    class Meta:
        model = NotificationLog
        fields = [
            'id',
            'user',
            'booking',
            'notification_type',
            'channel',
            'recipient',
            'subject',
            'content',
            'status',
            'sent_at',
            'created_at',
        ]
        # Most fields are likely read-only for a log, but depends on API use case
        read_only_fields = [
            'user',
            'booking',
            'notification_type',
            'channel',
            'recipient',
            'subject',
            'content',
            'status',
            'sent_at',
            'created_at',
        ]
