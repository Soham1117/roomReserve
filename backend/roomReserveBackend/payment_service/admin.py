from django.contrib import admin
from .models import PaymentStatus, Payment

# Register your models here.

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'booking', 'amount', 'currency', 'status', 'transaction_id', 'created_at')
    list_filter = ('status', 'currency', 'payment_method')
    search_fields = ('booking__booking_reference', 'transaction_id', 'booking__user__username')
    readonly_fields = ('transaction_id', 'created_at', 'updated_at')

@admin.register(PaymentStatus)
class PaymentStatusAdmin(admin.ModelAdmin):
    list_display = ('status_code', 'description')
