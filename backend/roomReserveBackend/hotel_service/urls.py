from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'amenities', views.AmenityViewSet, basename='amenity')
router.register(r'hotels', views.HotelViewSet, basename='hotel')
router.register(r'roomtypes', views.RoomTypeViewSet, basename='roomtype')
router.register(r'roomavailability', views.RoomAvailabilityViewSet, basename='roomavailability')

urlpatterns = [
    path('', include(router.urls)),
]
