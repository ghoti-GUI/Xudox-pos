from django.shortcuts import render, get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, JsonResponse
from django.template import loader
from django.contrib.auth.models import Group, User
from django.contrib.auth import authenticate, login
from django.db.models import Max
from rest_framework import permissions, viewsets
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action, api_view
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q
import json

from ..models import product, Test, TestImg, category, printe_to_where, tva
from ..serializers import TestSerializer, TestImgSerializer, AllTestImgSerializer, ProductSerializer, AllProductSerializer, AllCategorySerializer, CategorySerializer, GroupSerializer, UserSerializer

language = 'English'

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Group.objects.all().order_by('name')
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]


# @csrf_exempt
# def login_view(request):
#     data = request.POST
#     username = data.get('username')
#     password = data.get('password')
#     print(username, password)
#     user = authenticate(request, username=username, password=password)
#     if user is not None:
#         login(request, user)
#         return JsonResponse({'message': 'Login successful','id':user.id})
#     else:
#         return JsonResponse({'message': 'Invalid credentials'}, status=401)


@csrf_exempt
def login_view(request):
    data = request.POST
    username = data.get('username')
    password = data.get('password')
    user = authenticate(request, username=username, password=password)
    if user is not None:
        refresh = RefreshToken.for_user(user)
        return JsonResponse({
            'message': 'Login successful',
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            # 'user_id': user.id,
        })
    else:
        return JsonResponse({'message': 'Invalid credentials'}, status=400)


@csrf_exempt
def logout_view(request):
    try:
        data = request.POST
        refresh_token = data.get('refreshToken')
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response(status=status.HTTP_205_RESET_CONTENT)
    except Exception as e:
        return Response(status=status.HTTP_400_BAD_REQUEST)




