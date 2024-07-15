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

class TestViewSet(viewsets.ModelViewSet):
    queryset = Test.objects.all()
    serializer_class = TestSerializer
    permission_classes = [permissions.AllowAny]  # 开发阶段允许任何人访问

    def perform_create(self, serializer):
        # Here you can modify the data before saving
        des = 'testdes_autofill'
        serializer.save(
            des=des,
        )

class TestImgView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def get(self, request, *args, **kwargs):
        img = TestImg.objects.all()
        serializer = TestImgSerializer(img, many = True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        img_serializer = TestImgSerializer(data = request.data)
        if img_serializer.is_valid():
            img_serializer.save()
            return Response(img_serializer.data, status=status.HTTP_201_CREATED)
        else:
            print('error', img_serializer.errors)
            return Response(img_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TestImgViewSet(viewsets.ModelViewSet):
    queryset = TestImg.objects.all()
    serializer_class = TestImgSerializer
    permission_classes = [permissions.AllowAny]  # 开发阶段允许任何人访问

    # def perform_create(self, serializer):
    #     request_data = serializer.initial_data
    #     img = request_data.get('image')
    #     serializer.save(
    #         image = img, 
    #     )
    
def get_all_TestImg(request):
    imgs = TestImg.objects.all()
    serializer = AllTestImgSerializer(imgs, many = True)
    return JsonResponse(serializer.data, safe = False)
