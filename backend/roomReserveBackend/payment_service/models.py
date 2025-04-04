from django.db import models
from booking_service.models import Booking # Assuming Booking is in booking_service app
from django.core.validators import MinValueValidator
import uuid

# Create your models here.

class PaymentStatus(models.Model):
    """
    Represents the status of a payment transaction.
    Corresponds to the 'payment_statuses' table.
    """
    status_code = models.CharField(max_length=20, primary_key=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.status_code

    class Meta:
        # db_table = 'payment_statuses' # Removed
        verbose_name_plural = "Payment Statuses"

class Payment(models.Model):
    """
    Represents a payment transaction associated with a booking.
    Corresponds to the 'payments' table.
    """
    # Django automatically adds an 'id' field
    booking = models.ForeignKey(Booking, related_name='payments', on_delete=models.CASCADE) # Cascade delete if booking is deleted
    amount = models.DecimalField(max_digits=12, decimal_places=2, null=False, validators=[MinValueValidator(0)])
    currency = models.CharField(max_length=3, null=False, default='USD')
    payment_method = models.CharField(max_length=50, blank=True, null=True) # Simulated
    # transaction_id corresponds to the SQL field
    transaction_id = models.CharField(max_length=100, unique=True, blank=True, null=True, editable=False) # Allow blank/null initially
    status = models.ForeignKey(
        PaymentStatus,
        on_delete=models.PROTECT, # Don't delete payment if status type is deleted
        default='PENDING'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Generate a unique transaction ID if it doesn't exist and status is successful (example logic)
        if not self.transaction_id and self.status_id == 'SUCCESSFUL': # Use status_id for FK comparison
             # Example: PAY- followed by a short UUID
            self.transaction_id = f"PAY-{uuid.uuid4().hex[:12].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Payment {self.id} for Booking {self.booking.booking_reference} ({self.status})"

    # Meta class removed for db_table
