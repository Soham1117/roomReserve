from django.db import models
from django.contrib.auth.models import User
# Assuming RoomType is defined in hotel_service.models
# Adjust the import path if necessary based on your project structure
from hotel_service.models import RoomType
from django.core.validators import MinValueValidator
import uuid

# Create your models here.

class BookingStatus(models.Model):
    """
    Represents the status of a booking.
    Corresponds to the 'booking_statuses' table.
    """
    status_code = models.CharField(max_length=20, primary_key=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.status_code

    class Meta:
        # db_table = 'booking_statuses' # Removed
        verbose_name_plural = "Booking Statuses"

class Booking(models.Model):
    """
    Represents a customer booking.
    Corresponds to the 'bookings' table.
    """
    # Django automatically adds an 'id' field
    user = models.ForeignKey(User, on_delete=models.PROTECT) # Protect booking if user is deleted? Or CASCADE?
    room_type = models.ForeignKey(RoomType, on_delete=models.PROTECT) # Protect booking if room type is deleted?
    check_in_date = models.DateField(null=False)
    check_out_date = models.DateField(null=False)
    num_guests = models.IntegerField(null=False, validators=[MinValueValidator(1)])
    total_price = models.DecimalField(max_digits=12, decimal_places=2, null=False, validators=[MinValueValidator(0)])
    status = models.ForeignKey(
        BookingStatus,
        on_delete=models.PROTECT, # Don't delete booking if status type is deleted
        default='PENDING'
    )
    # booking_reference corresponds to the SQL field
    booking_reference = models.CharField(max_length=50, unique=True, null=False, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Generate a unique booking reference if it doesn't exist
        if not self.booking_reference:
            # Example: BKNG- followed by a short UUID
            self.booking_reference = f"BKNG-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs) # Call the "real" save() method.

    def __str__(self):
        return f"Booking {self.booking_reference} by {self.user.username}"

    class Meta:
        # db_table = 'bookings' # Removed
        # Add constraint to match SQL CHECK (check_out_date > check_in_date)
        # This is often handled in form/serializer validation in Django,
        # but can be added at the DB level too.
        constraints = [
            models.CheckConstraint(
                check=models.Q(check_out_date__gt=models.F('check_in_date')),
                name='chk_booking_dates'
            )
        ]

class BookingGuest(models.Model):
    """
    Represents guest details associated with a booking.
    Corresponds to the 'booking_guests' table.
    """
    booking = models.ForeignKey(Booking, related_name='guests', on_delete=models.CASCADE)
    first_name = models.CharField(max_length=50, blank=True, null=True)
    last_name = models.CharField(max_length=50, blank=True, null=True)
    is_primary = models.BooleanField(default=False)
    # Add other relevant guest details if needed

    def __str__(self):
        return f"{self.first_name or ''} {self.last_name or ''} (Booking: {self.booking.booking_reference})"

    # Meta class removed for db_table
