from rest_framework.routers import DefaultRouter
from posts.API.urls import post_router
from django.urls import path, include
from posts.API.ElectionData import get_election_data

router = DefaultRouter()
router.registry.extend(post_router.registry)

urlpatterns = [
    path('', include(router.urls)),
    path("election/<str:election_id>/", get_election_data),
]