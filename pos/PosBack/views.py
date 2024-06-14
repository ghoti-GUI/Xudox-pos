from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, JsonResponse
from django.template import loader
from django.contrib.auth.models import Group, User
from django.db.models import Max
from rest_framework import permissions, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action

from .models import product, Test, category, printe_to_where
from .serializers import TestSerializer, ProductSerializer, GroupSerializer, UserSerializer

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

class ProductViewSet(viewsets.ModelViewSet):
    queryset = product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]  # 开发阶段允许任何人访问

    def perform_create(self, serializer):
        request_data = serializer.initial_data
        ename = request_data.get('ename')
        lname = request_data.get('lname')
        fname = request_data.get('fname')
        zname = request_data.get('zname')
        edes = request_data.get('edes')
        ldes = request_data.get('ldes')
        fdes = request_data.get('fdes')
        serializer.save(
            ename=ename or ' ',
            lname=lname or ' ',
            fname=fname or ' ',
            zname=zname or ' ',
            print_name = ename or lname or fname or zname or ' ',
            edes=edes or ' ',
            ldes=ldes or ' ',
            fdes=fdes or ' ',
        )

# 根据id的最大值，返回下一个id给前端，用于id_user的默认值
def get_next_product_id(request):
    max_id = product.objects.aggregate(Max('id'))['id__max']
    next_id_user = max_id + 1 if max_id is not None else 1
    return JsonResponse({'next_id_user': next_id_user})

def get_categories(request):
    categories = category.objects.all()
    categoryData = {category.ename or category.lname or category.fname or category.zname: category.id for category in categories}
    return JsonResponse(categoryData)

def get_printer(request):
    printers = printe_to_where.objects.filter(id__lt=10) # return id<10
    printerData = {printer.id:printer.printer for printer in printers}
    return JsonResponse(printerData)



# class complete():
#     def post(self, request):
#         data_front = request.data.get('testdata')
#         complete_data = {
#             'name': data_front.name,
#             'des': 'testdes'
#         }
#         serializer = TestSerializer(data=complete_data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# @api_view(['POST'])
# def submit_data(request):



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
