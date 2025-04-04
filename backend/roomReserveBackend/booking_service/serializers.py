from rest_framework import serializers
from .models import BookingStatus, Booking, BookingGuest
# Import related serializers if needed for nesting
# from user_service.serializers import UserSerializer
# from hotel_service.serializers import RoomTypeSerializer

class BookingStatusSerializer(serializers.ModelSerializer):
    """Serializer for the BookingStatus model."""
    class Meta:
        model = BookingStatus
        fields = ['status_code', 'description']

class BookingGuestSerializer(serializers.ModelSerializer):
    """Serializer for the BookingGuest model."""
    class Meta:
        model = BookingGuest
        fields = ['id', 'booking', 'first_name', 'last_name', 'is_primary']
        read_only_fields = ['booking'] # Usually set when creating booking

class BookingSerializer(serializers.ModelSerializer):
    """Serializer for the Booking model."""
    # Represent related fields by their string representation or nested serializer
    user = serializers.StringRelatedField(read_only=True) # Show username
    room_type = serializers.StringRelatedField(read_only=True) # Show room type name
    status = serializers.SlugRelatedField(slug_field='status_code', queryset=BookingStatus.objects.all()) # Allow setting status by code
    guests = BookingGuestSerializer(many=True, required=False) # Nested guests

    class Meta:
        model = Booking
        fields = [
            'id',
            'user',
            'room_type',
            'booking_reference',
            'check_in_date',
            'check_out_date',
            'num_guests',
            'total_price',
            'status',
            'guests', # Include nested guests
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['user', 'booking_reference', 'created_at', 'updated_at']

    # Add create/update logic if handling nested guests directly
    # def create(self, validated_data):
    #     guests_data = validated_data.pop('guests', [])
    #     booking = Booking.objects.create(**validated_data)
    #     for guest_data in guests_data:
    #         BookingGuest.objects.create(booking=booking, **guest_data)
    #     return booking

    # def update(self, instance, validated_data):
    #     # Handle guest updates if needed
    #     # ...
    #     return super().update(instance, validated_data)
