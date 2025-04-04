from django.contrib.auth.models import User, Group
from rest_framework import viewsets, permissions
from .serializers import UserSerializer, GroupSerializer
# from .models import Role # If using custom Role model
# from .serializers import RoleSerializer # If using custom Role model

# Create your views here.

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    # Allow anyone to register (POST), but require authentication for other actions
    permission_classes = [permissions.AllowAny] # Default AllowAny for now, refine later if needed

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        Allow POST (create/register) without authentication.
        """
        if self.action == 'create':
            permission_classes = [permissions.AllowAny]
        else:
            # Require authentication for list, retrieve, update, destroy etc.
            permission_classes = [permissions.IsAuthenticated]
            # Or use IsAdminUser for listing all users etc.
            # permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in permission_classes]


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups (roles) to be viewed or edited.
    """
    queryset = Group.objects.all().order_by('name')
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAdminUser] # Example: Only admin users

# If using custom Role model:
# class RoleViewSet(viewsets.ModelViewSet):
#     queryset = Role.objects.all().order_by('name')
#     serializer_class = RoleSerializer
#     permission_classes = [permissions.IsAdminUser] # Example permission
