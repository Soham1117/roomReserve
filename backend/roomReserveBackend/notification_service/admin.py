from django.contrib import admin
from .models import NotificationType, NotificationLog

# Register your models here.

@admin.register(NotificationLog)
class NotificationLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'booking', 'notification_type', 'channel', 'recipient', 'status', 'sent_at', 'created_at')
    list_filter = ('notification_type', 'channel', 'status', 'created_at')
    search_fields = ('recipient', 'subject', 'content', 'user__username', 'booking__booking_reference')
    readonly_fields = ('user', 'booking', 'notification_type', 'channel', 'recipient', 'subject', 'content', 'status', 'sent_at', 'created_at')
    date_hierarchy = 'created_at'

    # Make the admin read-only for logs
    def has_add_permission(self, request):
        return False
    def has_change_permission(self, request, obj=None):
        return False
    # Allow deletion if needed, otherwise set to False
    # def has_delete_permission(self, request, obj=None):
    #     return False

@admin.register(NotificationType)
class NotificationTypeAdmin(admin.ModelAdmin):
    list_display = ('type_code', 'description')
