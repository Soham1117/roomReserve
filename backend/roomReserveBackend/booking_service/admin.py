from django.contrib import admin
from .models import BookingStatus, Booking, BookingGuest

# Register your models here.

class BookingGuestInline(admin.TabularInline):
    model = BookingGuest
    extra = 1 # Show one empty guest form by default

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('booking_reference', 'user', 'room_type', 'check_in_date', 'check_out_date', 'status', 'total_price', 'created_at')
    list_filter = ('status', 'check_in_date', 'room_type__hotel')
    search_fields = ('booking_reference', 'user__username', 'room_type__name', 'room_type__hotel__name')
    date_hierarchy = 'check_in_date'
    readonly_fields = ('booking_reference', 'created_at', 'updated_at') # These are auto-set
    inlines = [BookingGuestInline] # Manage guests directly on booking page

@admin.register(BookingStatus)
class BookingStatusAdmin(admin.ModelAdmin):
    list_display = ('status_code', 'description')

# BookingGuest is managed via BookingAdmin inline
# admin.site.register(BookingGuest)
