from rest_framework import serializers
from .models import UserProfile, UserPreferences
from django.contrib.auth.models import User

# We might need the UserSerializer if we want to nest user details
# from auth_service.serializers import UserSerializer

class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for the UserProfile model.
    """
    # Optionally make the user field read-only or exclude it if
    # the profile is always accessed via the User object.
    # user = UserSerializer(read_only=True) # Example if nesting User details
    email = serializers.EmailField(source='user.email', read_only=True)
    roles = serializers.SerializerMethodField() # Add roles field

    class Meta:
        model = UserProfile
        # Include all fields from the UserProfile model + email
        fields = [
            'user', # Represents the user_id (primary key)
            'email', # Added email field
            'first_name',
            'last_name',
            'phone_number',
            'address_line1',
            'address_line2',
            'city',
            'state',
            'postal_code',
            'country',
            'roles', # Include roles in fields
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['user', 'email', 'roles', 'created_at', 'updated_at'] # Make roles read-only

    def get_roles(self, obj):
        """
        Returns a list of role names for the user associated with the profile.
        Assumes roles are linked directly to the User model (e.g., via ManyToMany).
        Adjust based on your actual Role model relationship (e.g., through auth_service).
        """
        # This assumes a 'roles' ManyToMany field exists on the User model.
        # If roles are managed differently (e.g., in auth_service), adjust the query.
        # Example: return [role.name for role in obj.user.roles.all()]
        # For now, returning a placeholder based on is_staff/is_superuser
        user = obj.user
        if user.is_superuser:
            return ['admin', 'user'] # Example superuser roles
        elif user.is_staff:
            return ['hotel_manager', 'user'] # Example staff roles
        return ['user'] # Default role

class UserPreferencesSerializer(serializers.ModelSerializer):
    """
    Serializer for the UserPreferences model.
    """
    class Meta:
        model = UserPreferences
        fields = [
            'user', # Represents the user_id (primary key)
            'preferred_language',
            'newsletter_subscribed',
            'updated_at',
        ]
        read_only_fields = ['user', 'updated_at']
