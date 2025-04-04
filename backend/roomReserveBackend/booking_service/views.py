from rest_framework import viewsets, permissions
from .models import BookingStatus, Booking, BookingGuest
from .serializers import (
    BookingStatusSerializer,
    BookingSerializer,
    BookingGuestSerializer
)
# from .permissions import IsBookingOwnerOrAdmin # Example custom permission

# Create your views here.

class BookingStatusViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for viewing Booking Statuses."""
    queryset = BookingStatus.objects.all()
    serializer_class = BookingStatusSerializer
    permission_classes = [permissions.AllowAny] # Statuses are usually public info

class BookingViewSet(viewsets.ModelViewSet):
    """API endpoint for Bookings."""
    queryset = Booking.objects.all().order_by('-created_at')
    serializer_class = BookingSerializer
    # Users should only see/manage their own bookings, admins see all
    permission_classes = [permissions.IsAuthenticated] # Base: Must be logged in
    # Add custom permission like IsBookingOwnerOrAdmin

    def get_queryset(self):
        """Filter bookings based on the user."""
        user = self.request.user
        if user.is_staff: # Admins see all bookings
            return Booking.objects.all().order_by('-created_at')
        return Booking.objects.filter(user=user).order_by('-created_at')

    def perform_create(self, serializer):
        """Associate the booking with the logged-in user."""
        # TODO: Add logic to check room availability before saving
        # TODO: Add logic to calculate total_price based on dates/room_type/override
        serializer.save(user=self.request.user)

class BookingGuestViewSet(viewsets.ModelViewSet):
    """API endpoint for Booking Guests (less common to expose directly)."""
    queryset = BookingGuest.objects.all()
    serializer_class = BookingGuestSerializer
    # Permissions should likely restrict access based on the related booking's owner
    permission_classes = [permissions.IsAuthenticated] # Example base permission

    # Add filtering based on booking_id or user
    # def get_queryset(self):
    #     # ... filtering logic ...
    #     pass
