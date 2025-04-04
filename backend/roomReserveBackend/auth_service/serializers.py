from django.contrib.auth.models import User, Group # Group can represent Roles
from rest_framework import serializers
# from .models import Role # If using the custom Role model
from user_service.models import UserProfile 
# Note: Django's Group model is often used for roles/permissions.
# If using the custom Role model, import it and create a serializer for it.

class UserSerializer(serializers.HyperlinkedModelSerializer):
    """
    Serializer for the built-in User model.
    Includes basic fields and potentially related profile/preference data later.
    """
    # Make password write-only and required for creation
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    
    # Example of adding related data if UserProfile was linked via related_name='profile'
    # profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        # Fields to include in the API representation
        # Added 'password' to fields for creation, but it's write_only
        fields = ['url', 'id', 'username', 'password', 'email', 'first_name', 'last_name', 'is_staff', 'groups']
        # 'groups' field represents the ManyToMany relationship to Django's Group model
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        """Handle password hashing during user creation."""
        print(validated_data)
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''), # Handle optional email
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        # Add user to default group if needed
        # default_group, created = Group.objects.get_or_create(name='default_user_group')
        # user.groups.add(default_group)

        # Update the associated UserProfile created by the signal
        try:
        # This will raise UserProfile.DoesNotExist if not found
            profile = user.userprofile
            # print(user, profile.first_name, type(profile))
            
            # Only update if necessary
            if profile.first_name != validated_data.get('first_name', '') or \
                profile.last_name != validated_data.get('last_name', ''):
                profile.first_name = validated_data.get('first_name', '')
                profile.last_name = validated_data.get('last_name', '')
                profile.save(update_fields=['first_name', 'last_name'])
                    
        except UserProfile.DoesNotExist:
            # Create it if signal somehow failed
            print(f"Warning: UserProfile not found for user {user.username} during registration.")
            UserProfile.objects.create(
                user=user,
                first_name=validated_data.get('first_name', ''),
                last_name=validated_data.get('last_name', '')
            )

        return user

class GroupSerializer(serializers.HyperlinkedModelSerializer):
    """
    Serializer for Django's built-in Group model (representing roles).
    """
    class Meta:
        model = Group
        fields = ['url', 'id', 'name']

# If using the custom Role model instead of Group:
# class RoleSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Role
