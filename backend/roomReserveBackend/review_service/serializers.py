from rest_framework import serializers
from .models import Review, ReviewResponse
# from user_service.serializers import UserSerializer # If nesting user details
# from hotel_service.serializers import HotelSerializer # If nesting hotel details
# from booking_service.serializers import BookingSerializer # If nesting booking details

class ReviewResponseSerializer(serializers.ModelSerializer):
    """Serializer for the ReviewResponse model."""
    responder_user = serializers.StringRelatedField(read_only=True) # Show username

    class Meta:
        model = ReviewResponse
        fields = [
            'review', # Primary key (points to Review ID)
            'responder_user',
            'response_text',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['review', 'responder_user', 'created_at', 'updated_at']

class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for the Review model."""
    # Represent related fields by their string representation or nested serializer
    user = serializers.StringRelatedField(read_only=True) # Show username
    hotel = serializers.StringRelatedField(read_only=True) # Show hotel name
    booking = serializers.StringRelatedField(read_only=True) # Show booking reference (optional)
    response = ReviewResponseSerializer(read_only=True) # Nested response

    class Meta:
        model = Review
        fields = [
            'id',
            'hotel',
            'user',
            'booking',
            'rating',
            'title',
            'comment',
            'response', # Include nested response
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['user', 'hotel', 'booking', 'created_at', 'updated_at'] # User/hotel/booking set on creation
