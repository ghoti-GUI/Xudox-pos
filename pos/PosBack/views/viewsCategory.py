from django.shortcuts import render, get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, JsonResponse
from django.template import loader
from django.contrib.auth.models import Group, User
from django.db.models import Max
from rest_framework import permissions, viewsets
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action, api_view
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
import json

from ..models import product, Test, TestImg, category, printe_to_where, tva
from ..serializers import TestSerializer, TestImgSerializer, AllTestImgSerializer, ProductSerializer, AllProductSerializer, AllCategorySerializer, CategorySerializer, GroupSerializer, UserSerializer

language = 'English'


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = category.objects.all()
    serializer_class = CategorySerializer
    # permission_classes = [permissions.AllowAny]  # 开发阶段允许任何人访问
    permission_classes = (IsAuthenticated, )

    advanceKeyList={
        'ename':'',
        'lname':'', 
        'fname':'', 
        'zname':'', 
        'edes':'',
        'ldes':'',
        'fdes':'',
    }

    def perform_create(self, serializer):
        request_data = serializer.initial_data
        user_id = self.request.user.id
        save_data = {'rid':user_id}
        for advanceKey in self.advanceKeyList:
            if advanceKey in request_data:
                save_data[advanceKey]=request_data[advanceKey]
            else:
                save_data[advanceKey]=self.advanceKeyList[advanceKey]
        # 通过收到的是图片路径，获取并复制图片，保存
        if 'imgUrl' in request_data:
            imgUrl = request_data['imgUrl']
            if imgUrl:
                imgUrl = imgUrl[1:] # 去掉开头的'/'
                fullImgPath = os.path.join(settings.BASE_DIR, imgUrl)
                imgFile = None
                if os.path.exists(fullImgPath):
                    imgFile = open(fullImgPath, 'rb')
                    imgPath = os.path.dirname(imgUrl) # 获取名字前面的path
                    imgName = os.path.basename(imgUrl) # 获取名字
                    # 创建新的名字
                    imgNameList = imgName.split('.')
                    newImgName = imgNameList[0]+f'_{request_data.get("id_Xu")}.'+imgNameList[1]
                    # 组合
                    newImgUrl = imgPath+'/'+newImgName
                    path = default_storage.save(newImgUrl, imgFile)
                    save_data['img'] = newImgUrl
        serializer.save(**save_data)

    def create(self, request, *args, **kwargs):
        # user_id = request.user.id
        # # 将用户ID添加到请求数据中
        # data = request.data.copy()
        # data['rid'] = user_id

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        returnData = serializer.data
        returnData['id'] = serializer.instance.id
        return Response(returnData, status=status.HTTP_201_CREATED, headers=headers)


@api_view(['GET'])
def check_name_category_existence(request):
    name_category_received = request.query_params.get('categoryName', '')
    # rid_received = request.query_params.get('rid', '')
    user = request.user
    rid_received = user.id
    try:
        category.objects.get(
            Q(name = name_category_received)|
            Q(ename = name_category_received)|
            Q(fname = name_category_received)|
            Q(lname = name_category_received)|
            Q(zname = name_category_received), 
            rid=rid_received)
        return JsonResponse({'existed':True})
    except category.DoesNotExist:
        return JsonResponse({'existed':False})

@api_view(['GET'])
def get_all_categories(request):
    # restaurant = request.query_params.get('rid', '')
    user = request.user
    restaurant = user.id
    categories = category.objects.filter(rid = restaurant)
    serializer = AllCategorySerializer(categories, many = True)
    return JsonResponse(serializer.data, safe = False)

@api_view(['GET'])
def get_cid_by_categoryName(request):
    category_name = request.query_params.get('category_name', '')
    user = request.user
    rid_received = user.id
    categories = category.objects.filter(
        Q(rid=rid_received) & (
        Q(name=category_name) |
        Q(ename=category_name) |
        Q(lname=category_name) |
        Q(fname=category_name) |
        Q(zname=category_name))
    )
    if categories:
        cid = categories[0].id
        return JsonResponse({'cid':cid})
    else:
        return JsonResponse({'status': 'get cid by name error'}, status=111)

@api_view(['GET'])
def get_category_by_name(request):
    category_name = request.query_params.get('category_name', '')
    user = request.user
    rid_received = user.id
    categories = category.objects.filter(
        Q(rid=rid_received) & (
        Q(name=category_name) |
        Q(ename=category_name) |
        Q(lname=category_name) |
        Q(fname=category_name) |
        Q(zname=category_name))
    )
    if categories:
        serializer = AllCategorySerializer(categories[0])
        return JsonResponse(serializer.data, safe=False)
    else:
        return JsonResponse({'status': 'get cid by name error'}, status=111)


@api_view(['POST'])
def update_category_by_id(request):
    try:
        data = request.POST
        files = request.FILES
        id_received = data.get('id', '')
        user = request.user
        rid_received = user.id
        if rid_received:
            category_to_update = get_object_or_404(category, Q(id=id_received) & Q(rid=int(rid_received)))
            for key, value in data.items():
                if key!='id' and key!='rid':  # 确保不修改 id
                    if key=='img':
                        img = data.get('img', '')
                    elif hasattr(category_to_update, key):
                        setattr(category_to_update, key, value)
            if 'img' in files:
                category_to_update.img = files['img']
            category_to_update.save()
            return JsonResponse({'status': 'success', 'message': 'Category updated successfully.'})
        else:
            return JsonResponse({'message': 'Invalid credentials'}, status=401)

    except category.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Category not found.'}, status=404)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
