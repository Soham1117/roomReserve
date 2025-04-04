from django.db import models
from django.contrib.auth.models import User
from hotel_service.models import Hotel # Assuming Hotel is in hotel_service app
from booking_service.models import Booking # Assuming Booking is in booking_service app
from django.core.validators import MinValueValidator, MaxValueValidator

# Create your models here.

class Review(models.Model):
    """
    Represents a customer review for a hotel.
    Corresponds to the 'reviews' table.
    """
    # Django automatically adds an 'id' field
    hotel = models.ForeignKey(Hotel, related_name='reviews', on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name='reviews', on_delete=models.CASCADE)
    # Changed to OneToOneField as suggested by warning W342
    booking = models.OneToOneField(
        Booking,
        related_name='review',
        on_delete=models.SET_NULL,
        blank=True,
        null=True
        # unique=True is implied by OneToOneField
    )
    rating = models.DecimalField(
        max_digits=2,
        decimal_places=1,
        null=False,
        validators=[MinValueValidator(0.0), MaxValueValidator(5.0)]
    )
    title = models.CharField(max_length=255, blank=True, null=True)
    comment = models.TextField(blank=True, null=True) # Allow blank comments if only rating is given
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Review by {self.user.username} for {self.hotel.name} ({self.rating} stars)"

    class Meta:
        # db_table = 'reviews' # Removed
        # Optional: Add constraint to ensure user hasn't reviewed the same booking/hotel multiple times if needed
        # unique_together = ('hotel', 'user') # Example: Allow only one review per user per hotel
        pass # Add pass to maintain block structure

class ReviewResponse(models.Model):
    """
    Represents a response to a review (e.g., from hotel management).
    Corresponds to the 'review_responses' table.
    """
    # Django automatically adds an 'id' field
    review = models.OneToOneField(Review, related_name='response', on_delete=models.CASCADE, primary_key=True) # One response per review
    # Assuming responder is also a User (e.g., admin/manager role)
    responder_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True) # Keep response if responder deleted
    response_text = models.TextField(null=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Response to Review {self.review.id}"

    class Meta:
        # db_table = 'review_responses' # Removed
        verbose_name_plural = "Review Responses"
        pass # Add pass to maintain block structure
