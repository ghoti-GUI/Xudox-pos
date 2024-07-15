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
from django.db.models import Q
import json

from ..models import product, Test, TestImg, category, printe_to_where, tva
from ..serializers import TestSerializer, TestImgSerializer, AllTestImgSerializer, ProductSerializer, AllProductSerializer, AllCategorySerializer, CategorySerializer, GroupSerializer, UserSerializer

language = 'English'


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]  # 开发阶段允许任何人访问

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        returnData = serializer.data
        returnData['id'] = serializer.instance.id
        # print(returnData)
        return Response(returnData, status=status.HTTP_201_CREATED, headers=headers)


@api_view(['GET'])
def check_id_category_existence(request):
    id_category_received = request.query_params.get('id_category', '')
    rid_received = request.query_params.get('rid', '')
    try:
        category.objects.get(id = id_category_received, rid=rid_received)
        return JsonResponse({'existed':True})
    except category.DoesNotExist:
        return JsonResponse({'existed':False})

@api_view(['GET'])
def get_all_categories(request):
    restaurant = request.query_params.get('rid', '')
    categories = category.objects.filter(rid = restaurant)
    serializer = AllCategorySerializer(categories, many = True)
    return JsonResponse(serializer.data, safe = False)

@api_view(['GET'])
def get_cid_by_categoryName(request):
    category_name = request.query_params.get('category_name', '')
    rid_received = request.query_params.get('rid', '')
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
