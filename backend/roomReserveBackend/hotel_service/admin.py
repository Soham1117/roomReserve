from django.contrib import admin
from .models import Amenity, Hotel, RoomType, RoomAvailability, HotelAmenity

# Register your models here.

# Use TabularInline for the through model if desired
class HotelAmenityInline(admin.TabularInline):
    model = HotelAmenity
    extra = 1 # Number of empty forms to display

@admin.register(Hotel)
class HotelAdmin(admin.ModelAdmin):
    list_display = ('name', 'city', 'state', 'star_rating', 'updated_at')
    list_filter = ('city', 'state', 'star_rating')
    search_fields = ('name', 'city', 'description')
    inlines = [HotelAmenityInline] # Allows editing amenities directly on hotel page

@admin.register(Amenity)
class AmenityAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)

@admin.register(RoomType)
class RoomTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'hotel', 'capacity', 'base_price', 'updated_at')
    list_filter = ('hotel', 'capacity')
    search_fields = ('name', 'hotel__name')

@admin.register(RoomAvailability)
class RoomAvailabilityAdmin(admin.ModelAdmin):
    list_display = ('room_type', 'date', 'available_count', 'price_override')
    list_filter = ('date', 'room_type__hotel')
    search_fields = ('room_type__name', 'room_type__hotel__name')
    date_hierarchy = 'date'

# HotelAmenity is managed via HotelAdmin inline, no need to register separately unless needed
# admin.site.register(HotelAmenity)
