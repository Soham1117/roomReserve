from rest_framework import viewsets, permissions
from .models import Review, ReviewResponse
from .serializers import ReviewSerializer, ReviewResponseSerializer
# from .permissions import IsReviewOwnerOrReadOnly # Example custom permission

# Create your views here.

class ReviewViewSet(viewsets.ModelViewSet):
    """API endpoint for Reviews."""
    queryset = Review.objects.all().order_by('-created_at')
    serializer_class = ReviewSerializer
    # Allow anyone to read, but only authenticated users to create/update/delete (with ownership check)
    permission_classes = [permissions.IsAuthenticatedOrReadOnly] # Add IsReviewOwnerOrReadOnly later

    # Filter reviews by hotel_id if provided in query params
    def get_queryset(self):
        queryset = Review.objects.all()
        hotel_id = self.request.query_params.get('hotel_id')
        user_id = self.request.query_params.get('user_id')

        if hotel_id is not None:
            queryset = queryset.filter(hotel_id=hotel_id)
        if user_id is not None: # Allow filtering by user
            queryset = queryset.filter(user_id=user_id)

        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        """Associate the review with the logged-in user."""
        # Need to ensure hotel_id is provided in the request data
        # Consider checking if user actually stayed at the hotel (via booking)
        serializer.save(user=self.request.user)

class ReviewResponseViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Review Responses.
    Typically only editable by admins or hotel managers.
    """
    queryset = ReviewResponse.objects.all().order_by('-created_at')
    serializer_class = ReviewResponseSerializer
    permission_classes = [permissions.IsAdminUser] # Example: Only admins can respond

    # Filter responses by review_id if needed
    # def get_queryset(self):
    #     queryset = ReviewResponse.objects.all()
    #     review_id = self.request.query_params.get('review_id')
    #     if review_id is not None:
    #         queryset = queryset.filter(review_id=review_id)
    #     return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        """Associate the response with the logged-in admin user."""
        # Need to ensure review_id is provided in the request data
        serializer.save(responder_user=self.request.user)
