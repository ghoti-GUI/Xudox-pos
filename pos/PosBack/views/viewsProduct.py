from django.shortcuts import render, get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, JsonResponse
from django.template import loader
from django.contrib.auth.models import Group, User
from django.db.models import Max
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from rest_framework import permissions, viewsets
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action, api_view
from django.db.models import Q
from django.conf import settings
import json
import requests
import os

from ..models import product, Test, TestImg, category, printe_to_where, tva
from ..serializers import TestSerializer, TestImgSerializer, AllTestImgSerializer, ProductSerializer, AllProductSerializer, AllCategorySerializer, CategorySerializer, GroupSerializer, UserSerializer

language = 'English'

class ProductViewSet(viewsets.ModelViewSet):
    queryset = product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]  # 开发阶段允许任何人访问

    def perform_create(self, serializer):
        advanceKeyList = {
            'online_content':'',
            'online_des':'', 
            'product_type':0,
            'min_nbr':1,
            'discount':'',
            'allergen':'', 
            'id_user':'',
            'ename':'',
            'lname':'', 
            'fname':'', 
            'zname':'', 
            'edes':'',
            'ldes':'',
            'fdes':'',
            'stb':0,
            'favourite':0,
            'img':None, 
        }
        request_data = serializer.initial_data
        country_value = request_data.get('TVA_country')
        category_value = request_data.get('TVA_category')
        TVA = get_object_or_404(tva, **{f'country{language}' : country_value, 'category' : category_value})
        save_data={
            'TVA_id' : TVA, 
            'id_user' : request_data.get('id_Xu'),  
        }
        for advanceKey in advanceKeyList:
            if advanceKey in request_data:
                save_data[advanceKey]=request_data[advanceKey]
            else:
                save_data[advanceKey]=advanceKeyList[advanceKey]

        # 通过收到的图片路径，获取并复制图片，保存
        if 'imgUrl' in request_data:
            imgUrl = request_data['imgUrl']
            if imgUrl:
                imgUrl = imgUrl[1:] # 去掉开头的'/'
                # imgResponse = requests.get('http://localhost:8000/'+imgUrl)
                fullImgPath = os.path.join(settings.BASE_DIR, imgUrl)
                imgFile = None
                # if imgResponse.status_code == 200:
                if os.path.exists(fullImgPath):
                    imgFile = open(fullImgPath, 'rb')

                    imgPath = os.path.dirname(imgUrl) # 获取名字前面的path
                    imgName = os.path.basename(imgUrl) # 获取名字
                    # 创建新的名字
                    imgNameList = imgName.split('.')
                    newImgName = imgNameList[0]+f'_{request_data.get("id_Xu")}.'+imgNameList[1]
                    # 组合
                    newImgUrl = imgPath+'/'+newImgName
                    # print(newImgUrl)
                    # path = default_storage.save(newImgUrl, ContentFile(imgResponse.content))
                    path = default_storage.save(newImgUrl, imgFile)
                    print(path)
                    save_data['img'] = newImgUrl
        
        serializer.save(**save_data)

# def searchTVAId(TVA_country, TVA_category, language):
#     TVA_ = get_object_or_404(tva, **{f'country{language}' : TVA_country, 'category' : TVA_category})
#     return TVA

@csrf_exempt
def update_product_by_id(request):
    try:
        data = request.POST
        files = request.FILES
        id_received = data.get('id', '')
        rid_received = data.get('rid', 0)
        product_to_update = get_object_or_404(product, Q(id=id_received) & Q(rid=int(rid_received)))
        for key, value in data.items():
            if key!='id' and key!='rid':  # 确保不修改 id
                if key=='cid':
                    try:
                        category_instance = get_object_or_404(category, Q(id=int(value)) & Q(rid=int(rid_received)))
                        setattr(product_to_update, key, category_instance)
                    except (ValueError, category.DoesNotExist):
                        print(f"Invalid category id: {value}")
                elif key=='TVA_country':
                    try:
                        TVA_country = data.get('TVA_country', '')
                        TVA_category = data.get('TVA_category', '')
                        # print(TVA_country, TVA_category, type(TVA_category))
                        TVA = get_object_or_404(tva, **{f'countryEnglish' : TVA_country, 'category' : TVA_category})
                        # print(TVA)
                        setattr(product_to_update, 'TVA_id', TVA)
                    except (ValueError, category.DoesNotExist):
                        print(f"Invalid TVA data: {data.items.TVA_country}, {data.items.TVA_category}")
                elif key=='img':
                    img = data.get('img', '')
                    print(img)
                elif hasattr(product_to_update, key) and key!='TVA_category':
                    print(value)
                    setattr(product_to_update, key, value)

        if 'img' in files:
            product_to_update.img = files['img']


        product_to_update.save()
        return JsonResponse({'status': 'success', 'message': 'Product updated successfully.'})

    except product.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Product not found.'}, status=404)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)



# # 根据id的最大值，返回下一个id给前端，用于id_user的默认值
# def get_next_product_id(request):
#     max_id = product.objects.aggregate(Max('id'))['id__max']
#     next_id_user = max_id + 1 if max_id is not None else 1
#     return JsonResponse({'next_id_user': next_id_user})

@api_view(['GET'])
def check_id_Xu_existence(request):
    id_Xu_received = request.query_params.get('id_Xu', '')
    rid_received = request.query_params.get('rid', '')
    try:
        product.objects.get(id_Xu = id_Xu_received, rid=rid_received)
        return JsonResponse({'existed':True})
    except product.DoesNotExist:
        return JsonResponse({'existed':False})

@api_view(['GET'])
def get_all_products(request):
    rid_received = request.query_params.get('rid', '')
    products = product.objects.filter(rid = rid_received)
    serializer = AllProductSerializer(products, many = True)
    return JsonResponse(serializer.data, safe = False)

@api_view(['GET'])
def get_all_products_front_form(request):
    rid_received = request.query_params.get('rid', '')
    products = product.objects.filter(rid = rid_received)
    product_serializer = AllProductSerializer(products, many = True)
    products_data = product_serializer.data
    for product_data in products_data:
        # print(product_data)
        tva_id = product_data.get('TVA_id')
        tva_data = tva.objects.get(id=tva_id)
        product_data['tva_country'] = tva_data.countryEnglish
        product_data['tva_category'] = tva_data.category
        product_data['tva_value'] = tva_data.tva_value
    return JsonResponse(products_data, safe = False)
    # return JsonResponse(serializer.data, safe = False)


@api_view(['GET'])
def get_product_by_id_Xu(request):
    id_Xu = request.query_params.get('id_Xu', '')
    rid_received = request.query_params.get('rid', '')
    product_info = get_object_or_404(product, Q(id_Xu=id_Xu) & Q(rid=rid_received))
    serializer = AllProductSerializer(product_info)
    return JsonResponse(serializer.data)

@csrf_exempt
def delete_product(request):
    try:
        id_recv = request.POST.get('id')
        rid_recv = request.POST.get('rid')
        product_to_delete = get_object_or_404(product, Q(id=id_recv) & Q(rid=rid_recv))
        product_to_delete.delete()

        return JsonResponse({'status': 'success', 'message': f'product {id_recv} deleted successfully.'})

    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)