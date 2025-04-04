from django.contrib import admin
from .models import Review, ReviewResponse

# Register your models here.

class ReviewResponseInline(admin.StackedInline): # Use StackedInline for longer text field
    model = ReviewResponse
    readonly_fields = ('responder_user', 'created_at', 'updated_at') # Response user set automatically
    extra = 0 # Don't show empty response form by default

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('id', 'hotel', 'user', 'rating', 'title', 'created_at')
    list_filter = ('rating', 'created_at', 'hotel')
    search_fields = ('title', 'comment', 'user__username', 'hotel__name', 'booking__booking_reference')
    readonly_fields = ('user', 'hotel', 'booking', 'created_at', 'updated_at') # These are set programmatically
    date_hierarchy = 'created_at'
    inlines = [ReviewResponseInline] # Allow adding/editing response on review page

# ReviewResponse is managed via ReviewAdmin inline
# admin.site.register(ReviewResponse)
