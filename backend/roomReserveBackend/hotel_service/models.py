from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

# Create your models here.

class Amenity(models.Model):
    """
    Represents a hotel amenity (e.g., WiFi, Pool).
    Corresponds to the 'amenities' table.
    """
    name = models.CharField(max_length=100, unique=True, null=False)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

    class Meta:
        # db_table = 'amenities' # Removed
        verbose_name_plural = "Amenities"

class Hotel(models.Model):
    """
    Represents a hotel.
    Corresponds to the 'hotels' table.
    """
    name = models.CharField(max_length=255, null=False)
    description = models.TextField(blank=True, null=True)
    address_line1 = models.CharField(max_length=255, blank=True, null=True)
    address_line2 = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    postal_code = models.CharField(max_length=20, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    star_rating = models.DecimalField(
        max_digits=2,
        decimal_places=1,
        blank=True,
        null=True,
        validators=[MinValueValidator(0.0), MaxValueValidator(5.0)]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # ManyToManyField to represent the hotel_amenities relationship
    amenities = models.ManyToManyField(
        Amenity,
        through='HotelAmenity', # Explicitly specify intermediate model if needed, otherwise Django creates one
        related_name='hotels',
        blank=True
    )

    def __str__(self):
        return self.name

    # Meta class removed for db_table

class HotelAmenity(models.Model):
    """
    Intermediate model for the ManyToMany relationship between Hotel and Amenity.
    Corresponds to the 'hotel_amenities' table.
    Django can often manage this automatically, but defining it explicitly
    matches the manually created SQL table.
    """
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE)
    amenity = models.ForeignKey(Amenity, on_delete=models.CASCADE)

    class Meta:
        # db_table = 'hotel_amenities' # Removed
        unique_together = ('hotel', 'amenity') # Ensures combination is unique
        verbose_name_plural = "Hotel Amenities"

class RoomType(models.Model):
    """
    Represents a type of room available in a hotel.
    Corresponds to the 'room_types' table.
    """
    hotel = models.ForeignKey(Hotel, related_name='room_types', on_delete=models.CASCADE)
    name = models.CharField(max_length=100, null=False)
    description = models.TextField(blank=True, null=True)
    capacity = models.IntegerField(null=False, validators=[MinValueValidator(1)])
    base_price = models.DecimalField(max_digits=10, decimal_places=2, null=False, validators=[MinValueValidator(0)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.hotel.name} - {self.name}"

    # Meta class removed for db_table

class RoomAvailability(models.Model):
    """
    Tracks the number of available rooms of a specific type on a given date.
    Corresponds to the 'room_availability' table.
    """
    room_type = models.ForeignKey(RoomType, related_name='availability', on_delete=models.CASCADE)
    date = models.DateField(null=False)
    available_count = models.IntegerField(null=False, validators=[MinValueValidator(0)])
    price_override = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, validators=[MinValueValidator(0)])

    def __str__(self):
        return f"{self.room_type} on {self.date}: {self.available_count} available"

    class Meta:
        # db_table = 'room_availability' # Removed
        unique_together = ('room_type', 'date') # Matches SQL constraint
        verbose_name_plural = "Room Availability"
