from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TestViewSet, ProductViewSet

from . import views


router = DefaultRouter()
router.register(r'TestModel', TestViewSet)
router.register(r'post/product', ProductViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('get/product/next_id_user/', views.get_next_product_id, name='get_next_product_id'), 
    path('get/category/', views.get_categories, name='get_categories'), 
    path('get/printer/', views.get_printer, name = 'get_printer'), 

    # # ex: /TestModel/
    # path("", views.index, name="index"),
    # # ex: /TestModel/5/
    # path("detail/<int:product_id>/", views.detail, name="detail"),
    # # ex: /TestModel/5/results/
    # path("<int:product_id>/results/", views.results, name="results"),
    # # ex: /TestModel/5/vote/
    # path("<int:product_id>/vote/", views.vote, name="vote"),
]