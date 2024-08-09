from django.urls import path, include, re_path
from django.views.static import serve
# from pos.settings import MEDIA_ROOT
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
# from .views import TestViewSet, TestImgViewSet, ProductViewSet, CategoryViewSet
from .views import viewsProduct, viewsCategory, viewsPrinter, viewsTVA, viewsCommon, viewsUser, viewsTest, viewsDiscount


router = DefaultRouter()
router.register(r'TestModel', viewsTest.TestViewSet)
router.register(r'testimg/viewsets', viewsTest.TestImgViewSet)
router.register(r'post/product', viewsProduct.ProductViewSet)
router.register(r'post/category', viewsCategory.CategoryViewSet)
router.register(r'post/sw_discount', viewsDiscount.SwDiscountViewSet)

urlpatterns = [
    path('', include(router.urls)),

    path('api/login/', viewsUser.login_view, name='login'), 
    path('api/logout/', viewsUser.logout_view, name='logout'), 
    path('api/token/obtain/' , TokenObtainPairView.as_view(), name= 'token_create' ),
    # path('api/token/refresh/', viewsUser.CustomTokenRefreshView.as_view(), name='token_refresh'), 
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), 

    # path('get/product/next_id_user/', viewsProduct.get_next_product_id, name='get_next_product_id'), 
    path('product/check_id_Xu_existence/', viewsProduct.check_id_Xu_existence, name = 'check_id_Xu_existence'), 
    path('get/product/all/', viewsProduct.get_all_products, name = 'get_all_products'), 
    path('get/product/all/frontform/', viewsProduct.get_all_products_front_form, name = 'get_all_products_front_form'), 
    path('update/product_by_id/', viewsProduct.update_product_by_id, name='update_product_by_id'), 
    path('get/product/by/id_Xu/', viewsProduct.get_product_by_id_Xu, name='get_product_by_id_Xu'), 
    path('delete/product/', viewsProduct.delete_product, name='delete_product'), 

    path('get/category/all/', viewsCategory.get_all_categories, name='get_all_categories'), 
    path('category/check_name_category_existence/', viewsCategory.check_name_category_existence, name = 'check_name_category_existence'), 
    path('get/cid/by/categoryName/', viewsCategory.get_cid_by_categoryName, name='get_cid_by_categoryName'), 
    path('get/category/by/name/', viewsCategory.get_category_by_name, name='get_category_by_name'), 
    path('update/category_by_id/', viewsCategory.update_category_by_id, name='update_category_by_id'), 

    path('get/printers/', viewsPrinter.get_printer, name = 'get_printer'), 
    path('get/printers/all/', viewsPrinter.get_all_printer, name = 'get_all_printer'), 
    path('get/printers/by_id/', viewsPrinter.get_printers_by_id, name='get_printers_by_id'), 

    path('get/tva/', viewsTVA.get_TVA, name = 'get_TVA'),  
    path('get/tva/all/', viewsTVA.get_all_TVA, name = 'get_all_TVA'),  
    path('get/tva/by_id/', viewsTVA.get_TVA_by_id, name = 'get_TVA_by_id'), 
    path('get/tva_id/by_country_category/', viewsTVA.get_TVA_id_by_country_category, name = 'get_TVA_id_by_country_category'), 

    path('get/sw_discount/all/', viewsDiscount.get_all_sw_discounts, name='get_all_sw_discounts'), 
    path('update/sw_discount_by_id/', viewsDiscount.update_sw_discount_by_id, name='update_sw_discount_by_id'), 
    path('delete/sw_discount/', viewsDiscount.delete_sw_discount, name='delete_sw_discount'), 

    path('delete/all/', viewsCommon.delete_all, name='delete_all'), 
    path('update/Xu_class/', viewsCommon.update_Xu_class, name='update_Xu_class'), 
    path('get/ablist_kitchen_nonull/all/', viewsCommon.get_all_ablist_kitchen_nonull, name='get_all_ablist_kitchen_nonull'), 

    path('testimg/APIView/', viewsTest.TestImgView.as_view(), name = 'test_img'), 
    path('testimg/get_all_TestImg/', viewsTest.get_all_TestImg, name='get_all_TestImg'), 

]
