from rest_framework import serializers
from .models import Amenity, Hotel, RoomType, RoomAvailability, HotelAmenity

class AmenitySerializer(serializers.ModelSerializer):
    """Serializer for the Amenity model."""
    class Meta:
        model = Amenity
        fields = ['id', 'name', 'description']

class HotelSerializer(serializers.ModelSerializer):
    """Serializer for the Hotel model."""
    # Use AmenitySerializer for the nested representation of amenities
    amenities = AmenitySerializer(many=True, read_only=True)
    # Or use PrimaryKeyRelatedField for simpler representation (just IDs)
    # amenities = serializers.PrimaryKeyRelatedField(many=True, queryset=Amenity.objects.all())

    class Meta:
        model = Hotel
        fields = [
            'id',
            'name',
            'description',
            'address_line1',
            'address_line2',
            'city',
            'state',
            'postal_code',
            'country',
            'latitude',
            'longitude',
            'star_rating',
            'amenities', # Include the nested/related amenities
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

class RoomTypeSerializer(serializers.ModelSerializer):
    """Serializer for the RoomType model."""
    # Optionally include hotel details (e.g., hotel name)
    # hotel = serializers.StringRelatedField() # Example: Show hotel name

    class Meta:
        model = RoomType
        fields = [
            'id',
            'hotel', # Foreign key ID
            'name',
            'description',
            'capacity',
            'base_price',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['hotel', 'created_at', 'updated_at']

class RoomAvailabilitySerializer(serializers.ModelSerializer):
    """Serializer for the RoomAvailability model."""
    # Optionally include room type details
    # room_type = RoomTypeSerializer(read_only=True) # Example: Nested room type

    class Meta:
        model = RoomAvailability
        fields = [
            'id',
            'room_type', # Foreign key ID
            'date',
            'available_count',
            'price_override',
        ]
        # Consider making room_type read-only depending on API design
        # read_only_fields = ['room_type']
