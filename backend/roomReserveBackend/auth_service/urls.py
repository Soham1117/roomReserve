from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'users', views.UserViewSet, basename='user')
router.register(r'groups', views.GroupViewSet, basename='group')
# If using custom Role model:
# router.register(r'roles', views.RoleViewSet, basename='role')

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('', include(router.urls)),
    # Add other auth-related URLs here if needed (e.g., login, logout, registration)
    # path('api-auth/', include('rest_framework.urls', namespace='rest_framework')) # Optional: DRF login/logout views
]
