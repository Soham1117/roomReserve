from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'types', views.NotificationTypeViewSet, basename='notificationtype')
router.register(r'logs', views.NotificationLogViewSet, basename='notificationlog')

urlpatterns = [
    path('', include(router.urls)),
]
