from django.urls import path, include, re_path
from django.views.static import serve
# from pos.settings import MEDIA_ROOT
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from .views import TestViewSet, TestImgViewSet, ProductViewSet, CategoryViewSet
from . import views
from . import viewsTest


router = DefaultRouter()
router.register(r'TestModel', TestViewSet)
router.register(r'testimg/viewsets', TestImgViewSet)
router.register(r'post/product', ProductViewSet)
router.register(r'post/category', CategoryViewSet)

urlpatterns = [
    path('', include(router.urls)),

    path('get/product/next_id_user/', views.get_next_product_id, name='get_next_product_id'), 
    path('product/check_id_Xu_existence/', views.check_id_Xu_existence, name = 'check_id_Xu_existence'), 
    path('get/product/all/', views.get_all_products, name = 'get_all_products'), 
    path('update/product_by_id/', views.update_product_by_id, name='update_product_by_id'), 
    path('get/product/by/id_Xu/', views.get_product_by_id_Xu, name='get_product_by_id_Xu'), 
    path('update/Xu_class/', views.update_Xu_class, name='update_Xu_class'), 

    path('get/category/all/', views.get_all_categories, name='get_all_categories'), 
    path('category/check_id_category_existence/', views.check_id_category_existence, name = 'check_id_category_existence'), 
    path('get/cid/by/categoryName/', views.get_cid_by_categoryName, name='get_cid_by_categoryName'), 

    path('get/printers/', views.get_printer, name = 'get_printer'), 
    path('get/printers/by_id/', views.get_printers_by_id, name='get_printers_by_id'), 

    path('get/tva/', views.get_TVA, name = 'get_TVA'),  
    path('get/tva/by_id/', views.get_TVA_by_id, name = 'get_TVA_by_id'), 

    path('delete/all/', views.delete_all, name='delete_all'), 

    path('testimg/APIView/', views.TestImgView.as_view(), name = 'test_img'), 
    path('testimg/get_all_TestImg/', views.get_all_TestImg, name='get_all_TestImg'), 


    path('getToken/', viewsTest.getToken, name='getToken'),
    path('post/product/app/', viewsTest.add_products_app, name='add_products_app'), 

    

    # re_path(r'^media/(?P<path>.*)$', serve, {'document_root':MEDIA_ROOT}), 

    # # ex: /TestModel/
    # path("", views.index, name="index"),
    # # ex: /TestModel/5/
    # path("detail/<int:product_id>/", views.detail, name="detail"),
    # # ex: /TestModel/5/results/
    # path("<int:product_id>/results/", views.results, name="results"),
    # # ex: /TestModel/5/vote/
    # path("<int:product_id>/vote/", views.vote, name="vote"),
]

# if settings.DEBUG:
#         urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)