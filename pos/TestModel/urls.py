from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TestViewSet

from . import views


router = DefaultRouter()
router.register(r'TestModel', TestViewSet)

urlpatterns = [
    path('', include(router.urls)),
    # path('complete-data/', complete.as_view(), name='complete-data'),

    # # ex: /TestModel/
    # path("", views.index, name="index"),
    # # ex: /TestModel/5/
    # path("detail/<int:product_id>/", views.detail, name="detail"),
    # # ex: /TestModel/5/results/
    # path("<int:product_id>/results/", views.results, name="results"),
    # # ex: /TestModel/5/vote/
    # path("<int:product_id>/vote/", views.vote, name="vote"),
]