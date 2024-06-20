from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, JsonResponse
from django.template import loader
from django.contrib.auth.models import Group, User
from django.db.models import Max
from rest_framework import permissions, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action, api_view

from .models import product, Test, category, printe_to_where, tva
from .serializers import TestSerializer, ProductSerializer, AllProductSerializer, AllCategorySerializer, GroupSerializer, UserSerializer

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

class ProductViewSet(viewsets.ModelViewSet):
    queryset = product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]  # 开发阶段允许任何人访问

    def perform_create(self, serializer):
        request_data = serializer.initial_data
        country_value = request_data.get('TVA_country')
        caregory_value = request_data.get('TVA_category')
        TVA_id = get_object_or_404(tva, **{f'country{language}' : country_value, 'category' : request_data.get('TVA_category')})
        serializer.save(
            TVA_id = TVA_id, 
            id_user = request_data.get('id_Xu'), 
        )

# 根据id的最大值，返回下一个id给前端，用于id_user的默认值
def get_next_product_id(request):
    max_id = product.objects.aggregate(Max('id'))['id__max']
    next_id_user = max_id + 1 if max_id is not None else 1
    return JsonResponse({'next_id_user': next_id_user})

@api_view(['GET'])
def check_id_Xu_existence(request):
    # id_Xu_received = request.GET.get('id_Xu')
    id_Xu_received = request.query_params.get('id_Xu', '')
    print(id_Xu_received)
    try:
        product.objects.get(id_Xu = id_Xu_received)
        return JsonResponse({'existed':True})
    except product.DoesNotExist:
        return JsonResponse({'existed':False})

def get_all_products(request):
    products = product.objects.all()
    serializer = AllProductSerializer(products, many = True)
    return JsonResponse(serializer.data, safe = False)




def get_all_categories(request):
    categories = category.objects.all()
    serializer = AllCategorySerializer(categories, many = True)
    return JsonResponse(serializer.data, safe = False)



def get_printer(request):
    printers = printe_to_where.objects.filter(id__lt=10) # return id<10
    printerData = {printer.id:printer.printer for printer in printers}
    return JsonResponse(printerData)

@api_view(['GET'])
def get_TVA(request):
    request_language = request.query_params.get('language', '')
    country_field = f'country{request_language}'
    TVA_countrys = tva.objects.values_list(country_field, flat=True).distinct()
    TVAData = {}
    for TVA_country in TVA_countrys:
        tva_records = tva.objects.filter(**{country_field: TVA_country})
        TVAData[TVA_country] = {f'{tva_record.tva_value}%':tva_record.category for tva_record in tva_records}
    return JsonResponse(TVAData)



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
