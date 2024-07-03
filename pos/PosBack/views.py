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

from .models import product, Test, TestImg, category, printe_to_where, tva
from .serializers import TestSerializer, TestImgSerializer, AllTestImgSerializer, ProductSerializer, AllProductSerializer, AllCategorySerializer, CategorySerializer, GroupSerializer, UserSerializer

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
        
        serializer.save(**save_data)

# def searchTVAId(TVA_country, TVA_category, language):
#     TVA_ = get_object_or_404(tva, **{f'country{language}' : TVA_country, 'category' : TVA_category})
#     return TVA

@csrf_exempt
def update_product_by_id(request):
    try:
        data = request.POST
        id_received = data.get('id', '')
        product_to_update = get_object_or_404(product, id=id_received)

        for key, value in data.items():
            if key!='id':  # 确保不修改 id
                print(key)
                if key=='cid':
                    try:
                        category_instance = get_object_or_404(category, id=int(value))
                        setattr(product_to_update, key, category_instance)
                    except (ValueError, category.DoesNotExist):
                        print(f"Invalid category id: {value}")
                elif key=='TVA_country':
                    try:
                        TVA_country = data.get('TVA_country', '')
                        TVA_category = data.get('TVA_category', '')
                        print(TVA_country, TVA_category, type(TVA_category))
                        TVA = get_object_or_404(tva, **{f'country{language}' : TVA_country, 'category' : TVA_category})
                        print(TVA)
                        setattr(product_to_update, 'TVA_id', TVA)
                    except (ValueError, category.DoesNotExist):
                        print(f"Invalid TVA data: {data.items.TVA_country}, {data.items.TVA_category}")
                elif hasattr(product_to_update, key) and key!='TVA_category':
                    setattr(product_to_update, key, value)

        product_to_update.save()

        return JsonResponse({'status': 'success', 'message': 'Product updated successfully.'})
    except product.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Product not found.'}, status=404)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)






# 根据id的最大值，返回下一个id给前端，用于id_user的默认值
def get_next_product_id(request):
    max_id = product.objects.aggregate(Max('id'))['id__max']
    next_id_user = max_id + 1 if max_id is not None else 1
    return JsonResponse({'next_id_user': next_id_user})

@api_view(['GET'])
def check_id_Xu_existence(request):
    # id_Xu_received = request.GET.get('id_Xu')
    id_Xu_received = request.query_params.get('id_Xu', '')
    try:
        product.objects.get(id_Xu = id_Xu_received)
        return JsonResponse({'existed':True})
    except product.DoesNotExist:
        return JsonResponse({'existed':False})

def get_all_products(request):
    products = product.objects.all()
    serializer = AllProductSerializer(products, many = True)
    return JsonResponse(serializer.data, safe = False)


@api_view(['GET'])
def get_product_by_id_Xu(request):
    id_Xu = request.query_params.get('id_Xu', '')
    product_info = get_object_or_404(product, id_Xu=id_Xu)
    serializer = AllProductSerializer(product_info)
    return JsonResponse(serializer.data)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]  # 开发阶段允许任何人访问

@api_view(['GET'])
def check_id_category_existence(request):
    id_category_received = request.query_params.get('id_category', '')
    try:
        category.objects.get(id = id_category_received)
        return JsonResponse({'existed':True})
    except category.DoesNotExist:
        return JsonResponse({'existed':False})

def get_all_categories(request):
    categories = category.objects.all()
    serializer = AllCategorySerializer(categories, many = True)
    return JsonResponse(serializer.data, safe = False)



def get_printer(request):
    printers = printe_to_where.objects.filter(id__lt=10) # return id<10
    printerData = {printer.id:printer.printer for printer in printers}
    return JsonResponse(printerData)

@api_view(['GET'])
def get_printers_by_id(request):
    printers_id_group = request.query_params.get('printers_id', '')
    printers_id = str(printers_id_group)
    printers_data = []
    for printer_id in printers_id:
        printer = get_object_or_404(printe_to_where, id=printer_id)
        printers_data.append(printer.printer)
    return JsonResponse(printers_data, safe = False)



@api_view(['GET'])
def get_TVA(request):
    request_language = request.query_params.get('language', '')
    # request_language='English'
    country_field = f'country{request_language}'
    TVA_countrys = tva.objects.values_list(country_field, flat=True).distinct()
    TVAData = {}
    for TVA_country in TVA_countrys:
        tva_records = tva.objects.filter(**{country_field: TVA_country})
        TVAData[TVA_country] = {f'{tva_record.tva_value}%':tva_record.category for tva_record in tva_records}
    return JsonResponse(TVAData)

@api_view(['GET'])
def get_TVA_by_id(request):
    language = request.query_params.get('language', '')
    id = request.query_params.get('TVA_id', '')
    TVA_info = get_object_or_404(tva, id=id)
    country = f'country{language}'
    TVA_data = {
        'country':getattr(TVA_info, country, None),
        'category':TVA_info.category,
        'tva_value':TVA_info.tva_value, 
    }
    return JsonResponse(TVA_data)



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
