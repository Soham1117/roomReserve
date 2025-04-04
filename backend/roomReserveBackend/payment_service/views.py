from rest_framework import viewsets, permissions
from .models import PaymentStatus, Payment
from .serializers import PaymentStatusSerializer, PaymentSerializer
# from booking_service.permissions import IsBookingOwnerOrAdmin # Example

# Create your views here.

class PaymentStatusViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for viewing Payment Statuses."""
    queryset = PaymentStatus.objects.all()
    serializer_class = PaymentStatusSerializer
    permission_classes = [permissions.AllowAny] # Statuses are usually public

class PaymentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Payments.
    Permissions should restrict access based on the related booking owner.
    """
    queryset = Payment.objects.all().order_by('-created_at')
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated] # Base: Must be logged in
    # Add custom permission to check if user owns the related booking

    def get_queryset(self):
        """Filter payments based on the user who owns the booking."""
        user = self.request.user
        if user.is_staff: # Admins see all payments
            return Payment.objects.all().order_by('-created_at')
        # Filter payments where the related booking's user is the current user
        return Payment.objects.filter(booking__user=user).order_by('-created_at')

    # perform_create might be handled differently, e.g., triggered by booking confirmation
    # def perform_create(self, serializer):
    #     # Need to associate with a booking - how is booking_id provided?
    #     # serializer.save(booking=...)
    #     pass
