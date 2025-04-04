from rest_framework import viewsets, permissions, filters
import django_filters # Import django_filters
from django_filters.rest_framework import DjangoFilterBackend # Import DjangoFilterBackend explicitly
from .models import Amenity, Hotel, RoomType, RoomAvailability
from .serializers import (
    AmenitySerializer,
    HotelSerializer,
    RoomTypeSerializer,
    RoomAvailabilitySerializer
)
from .permissions import IsAdminOrReadOnly # Import custom permission

# Create your views here.

class AmenityViewSet(viewsets.ModelViewSet):
    """API endpoint for Amenities."""
    queryset = Amenity.objects.all().order_by('name')
    serializer_class = AmenitySerializer
    # Use custom permission: Allow read-only for all, write only for admin/staff
    permission_classes = [IsAdminOrReadOnly]

class HotelViewSet(viewsets.ModelViewSet):
    """API endpoint for Hotels."""
    queryset = Hotel.objects.all().prefetch_related('amenities').order_by('name') # Prefetch amenities
    serializer_class = HotelSerializer
    permission_classes = [IsAdminOrReadOnly] # Apply custom permission

    # Define filterset_fields for simple equality filters if needed
    # filterset_fields = ['city', 'country'] # Example

    # Add multiple filter backends
    filter_backends = [
        DjangoFilterBackend, # For django-filter fields
        filters.SearchFilter, # For ?search=...
        filters.OrderingFilter # For ?ordering=...
    ]

    # Fields for ?search=...
    search_fields = ['name', 'city', 'state', 'country', 'description']

    # Fields for ?ordering=... (maps to frontend sortBy: 'price', 'rating', 'name')
    # Note: 'price' isn't directly on Hotel model, requires annotation or different approach
    ordering_fields = ['star_rating', 'name']
    ordering = ['name'] # Default ordering

    # Fields for django-filter (handles min_rating, amenities)
    filterset_fields = {
        'star_rating': ['gte', 'lte'], # Allows ?star_rating__gte=4
        'amenities__name': ['in'], # Allows ?amenities__name__in=WiFi,Pool
        # Add price filtering later if price is added/calculated on Hotel model
    }

    # Custom filter logic could be added here if needed via a FilterSet class
    # class HotelFilter(django_filters.FilterSet):
    #     min_rating = django_filters.NumberFilter(field_name="star_rating", lookup_expr='gte')
    #     amenities = django_filters.CharFilter(method='filter_amenities') # Example custom method
    #
    #     class Meta:
    #         model = Hotel
    #         fields = ['min_rating', 'amenities'] # Fields handled by this FilterSet
    #
    #     def filter_amenities(self, queryset, name, value):
    #         # Custom logic if needed, e.g., splitting comma-separated string
    #         amenity_names = value.split(',')
    #         return queryset.filter(amenities__name__in=amenity_names).distinct()
    #
    # filterset_class = HotelFilter # Use the custom FilterSet class

class RoomTypeViewSet(viewsets.ModelViewSet):
    """API endpoint for Room Types."""
    queryset = RoomType.objects.all().order_by('hotel__name', 'base_price')
    serializer_class = RoomTypeSerializer
    permission_classes = [IsAdminOrReadOnly] # Apply custom permission

    # Could add filtering based on hotel_id in query params
    # def get_queryset(self):
    #     queryset = RoomType.objects.all()
    #     hotel_id = self.request.query_params.get('hotel_id')
    #     if hotel_id is not None:
    #         queryset = queryset.filter(hotel_id=hotel_id)
    #     return queryset.order_by('hotel__name', 'base_price')

class RoomAvailabilityViewSet(viewsets.ModelViewSet):
    """API endpoint for Room Availability."""
    queryset = RoomAvailability.objects.all().order_by('room_type__hotel__name', 'room_type__name', 'date')
    serializer_class = RoomAvailabilitySerializer
    permission_classes = [IsAdminOrReadOnly] # Apply custom permission

    # Add filtering based on room_type_id and date range
    # def get_queryset(self):
    #     queryset = RoomAvailability.objects.all()
    #     room_type_id = self.request.query_params.get('room_type_id')
    #     start_date = self.request.query_params.get('start_date')
    #     end_date = self.request.query_params.get('end_date')
    #
    #     if room_type_id:
    #         queryset = queryset.filter(room_type_id=room_type_id)
    #     if start_date:
    #         queryset = queryset.filter(date__gte=start_date)
    #     if end_date:
    #         queryset = queryset.filter(date__lte=end_date)
    #
    #     return queryset.order_by('room_type__hotel__name', 'room_type__name', 'date')
