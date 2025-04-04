from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

# Create your models here.

class UserProfile(models.Model):
    """
    Extends the built-in Django User model to add profile information.
    Corresponds to the 'user_profiles' table.
    """
    # user_id is the primary key and links to the User model.
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, related_name='userprofile') # Added related_name
    first_name = models.CharField(max_length=50, blank=True, null=True)
    last_name = models.CharField(max_length=50, blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    address_line1 = models.CharField(max_length=255, blank=True, null=True)
    address_line2 = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    postal_code = models.CharField(max_length=20, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    # Timestamps correspond to created_at and updated_at in the SQL
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.user.username

    # Meta class removed - let Django use default table name 'user_service_userprofile'

class UserPreferences(models.Model):
    """
    Stores user-specific preferences.
    Corresponds to the 'user_preferences' table.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, related_name='userpreferences') # Added related_name
    preferred_language = models.CharField(max_length=10, default='en')
    newsletter_subscribed = models.BooleanField(default=False)
    # updated_at corresponds to the SQL field
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Preferences"

    class Meta:
        # db_table = 'user_preferences' # Removed - let Django use default table name
        verbose_name_plural = "User Preferences" # Fix admin display name

# Single post_save handler for User creation
@receiver(post_save, sender=User)
def create_related_user_objects(sender, instance, created, **kwargs):
    """
    Creates UserProfile and UserPreferences when a new User is created.
    Copies first_name and last_name from User to UserProfile.
    """
    if created:
        # Create profile and copy name from User instance directly on create
        UserProfile.objects.create(
            user=instance,
            first_name=instance.first_name,
            last_name=instance.last_name
        )
        UserPreferences.objects.create(user=instance)

# Removed the separate update_user_profile and save_user_preferences signals
# Updates should be handled via the specific profile/preferences views/serializers
