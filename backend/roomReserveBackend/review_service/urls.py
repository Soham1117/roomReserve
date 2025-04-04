from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'reviews', views.ReviewViewSet, basename='review')
router.register(r'responses', views.ReviewResponseViewSet, basename='reviewresponse')

urlpatterns = [
    path('', include(router.urls)),
]
