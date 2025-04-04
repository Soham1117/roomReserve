from rest_framework import serializers
from .models import PaymentStatus, Payment
# from booking_service.serializers import BookingSerializer # If nesting booking details

class PaymentStatusSerializer(serializers.ModelSerializer):
    """Serializer for the PaymentStatus model."""
    class Meta:
        model = PaymentStatus
        fields = ['status_code', 'description']

class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for the Payment model."""
    # Represent related fields by their string representation or nested serializer
    booking = serializers.StringRelatedField(read_only=True) # Show booking reference
    status = serializers.SlugRelatedField(slug_field='status_code', queryset=PaymentStatus.objects.all()) # Allow setting status by code

    class Meta:
        model = Payment
        fields = [
            'id',
            'booking',
            'amount',
            'currency',
            'payment_method',
            'transaction_id',
            'status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['booking', 'transaction_id', 'created_at', 'updated_at']
