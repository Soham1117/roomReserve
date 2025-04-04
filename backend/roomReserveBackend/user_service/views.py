from rest_framework import viewsets, permissions, status
from .models import UserProfile, UserPreferences
from .serializers import UserProfileSerializer, UserPreferencesSerializer
from rest_framework.decorators import action # Import action decorator
from rest_framework.response import Response # Import Response
from django.shortcuts import get_object_or_404 # For fetching the single profile in 'me'

# Create your views here.

# Example Custom Permission (needs to be defined, e.g., in a permissions.py file)
# class IsOwnerOrReadOnly(permissions.BasePermission):
#     """
#     Custom permission to only allow owners of an object to edit it.
#     """
#     def has_object_permission(self, request, view, obj):
#         # Read permissions are allowed to any request,
#         # so we'll always allow GET, HEAD or OPTIONS requests.
#         if request.method in permissions.SAFE_METHODS:
#             return True
#         # Write permissions are only allowed to the owner of the profile/prefs.
#         # Assumes the object has a 'user' attribute.
#         return obj.user == request.user

class UserProfileViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows user profiles to be viewed or edited.
    Provides a /me/ endpoint for the logged-in user.
    """
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated] # Require authentication for all profile actions

    def get_queryset(self):
        """
        Admins see all profiles, regular users only see their own if listing is enabled.
        However, listing all profiles is generally discouraged for non-admins.
        The 'me' endpoint is the primary way for users to access their profile.
        """
        user = self.request.user
        if user.is_staff:
            return UserProfile.objects.all()
        # Return only the current user's profile if they try to list
        return UserProfile.objects.filter(user=user)

    def get_object(self):
        """
        Override to ensure users can only access their own profile via detail view
        (e.g., /api/users/profiles/{user_id}/), unless they are staff.
        """
        obj = super().get_object()
        # Check ownership only if the user is not staff
        if not self.request.user.is_staff and obj.user != self.request.user:
            self.permission_denied(
                self.request, message='You do not have permission to access this profile.'
            )
        return obj

    # perform_create is usually not needed here as profiles are created by signals

    def perform_update(self, serializer):
        # get_object already checks ownership, so we just save.
        serializer.save()

    def perform_destroy(self, instance):
         # get_object already checks ownership, so we just delete.
         # Consider if users should be allowed to delete their profiles.
         instance.delete()

    @action(detail=False, methods=['get', 'put', 'patch'], url_path='me', url_name='profile-me')
    def me(self, request, *args, **kwargs):
        """
        Retrieve, update or partially update the profile of the current authenticated user.
        """
        # Use get_object_or_404 to handle the case where the profile might not exist yet
        # (though signals should prevent this)
        profile = get_object_or_404(UserProfile, user=request.user)

        if request.method == 'GET':
            serializer = self.get_serializer(profile)
            return Response(serializer.data)

        elif request.method == 'PUT':
            serializer = self.get_serializer(profile, data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

        elif request.method == 'PATCH':
            serializer = self.get_serializer(profile, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

class UserPreferencesViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows user preferences to be viewed or edited.
    Provides a /me/ endpoint for the logged-in user.
    """
    queryset = UserPreferences.objects.all()
    serializer_class = UserPreferencesSerializer
    permission_classes = [permissions.IsAuthenticated] # Require authentication

    def get_queryset(self):
        """
        Admins see all preferences, regular users only see their own.
        """
        user = self.request.user
        if user.is_staff:
            return UserPreferences.objects.all()
        return UserPreferences.objects.filter(user=user)

    def get_object(self):
        """
        Ensure users can only access/modify their own preferences via detail view.
        """
        obj = super().get_object()
        if not self.request.user.is_staff and obj.user != self.request.user:
            self.permission_denied(
                 self.request, message='You do not have permission to access these preferences.'
            )
        return obj

    # perform_create handled by signals

    def perform_update(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
         # Consider if users should delete preferences or just reset them.
         if not self.request.user.is_staff and instance.user != self.request.user:
             self.permission_denied(self.request)
         instance.delete()

    @action(detail=False, methods=['get', 'put', 'patch'], url_path='me', url_name='preferences-me')
    def me(self, request, *args, **kwargs):
        """
        Retrieve, update or partially update the preferences of the current authenticated user.
        """
        prefs = get_object_or_404(UserPreferences, user=request.user)

        if request.method == 'GET':
            serializer = self.get_serializer(prefs)
            return Response(serializer.data)

        elif request.method == 'PUT':
            serializer = self.get_serializer(prefs, data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

        elif request.method == 'PATCH':
            serializer = self.get_serializer(prefs, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
