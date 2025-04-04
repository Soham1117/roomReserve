"""
URL configuration for roomReserveBackend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include # Import include
from rest_framework_simplejwt.views import ( # Import simplejwt views
    TokenObtainPairView,
    TokenRefreshView,
)
# Imports for drf-yasg
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# Schema view configuration for drf-yasg
schema_view = get_schema_view(
   openapi.Info(
      title="RoomReserve API",
      default_version='v1',
      description="API documentation for the RoomReserve microservices",
      # terms_of_service="https://www.google.com/policies/terms/", # Optional
      # contact=openapi.Contact(email="contact@roomreserve.local"), # Optional
      # license=openapi.License(name="BSD License"), # Optional
   ),
   public=True,
   permission_classes=(permissions.AllowAny,), # Adjust permissions as needed
)

urlpatterns = [
    path('admin/', admin.site.urls),
    # JWT Token URLs
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # API URLs for different services (Prefixed with v1)
    path('api/v1/auth/', include('auth_service.urls')),
    path('api/v1/users/', include('user_service.urls')),
    path('api/v1/hotels/', include('hotel_service.urls')),
    path('api/v1/bookings/', include('booking_service.urls')),
    path('api/v1/payments/', include('payment_service.urls')),
    path('api/v1/notifications/', include('notification_service.urls')),
    path('api/v1/reviews/', include('review_service.urls')),
    # Add search_service and admin_service URLs later if they have APIs
    # Optional DRF browsable API login/logout views
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    # drf-yasg URL patterns
    path('swagger<format>/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]
