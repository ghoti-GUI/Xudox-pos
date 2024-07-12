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
from django.middleware.csrf import get_token

from .models import product, Test, TestImg, category, printe_to_where, tva
from .serializers import TestSerializer, TestImgSerializer, AllTestImgSerializer, ProductSerializer, AllProductSerializer, AllCategorySerializer, CategorySerializer, GroupSerializer, UserSerializer


def getToken(request):
    token = get_token(request)
    print(token)
    return HttpResponse(json.dumps({'token': token}), content_type="application/json,charset=utf-8")


@csrf_exempt
def add_products_app(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            print(data)
            failed = []
            for product_data in data:
                print(product_data)
                result = process_product_data(product_data)
                if result:
                    failed.append(result)

            if failed:
                return JsonResponse({'status': 'error', 'message': 'Some imports failed', 'details': failed}, status=400)
            else:
                return JsonResponse({'status': 'success', 'message': 'All imports succeeded'}, status=200)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)

def process_product_data(product_data):
    # try:
    #     category, created = Category.objects.get_or_create(name=product_data['name'], Xu_class=product_data['Xu_class'], rid=product_data['rid'])
    #     Product.objects.create(
    #         id_Xu=product_data['id_Xu'],
    #         bill_content=product_data['bill_content'],
    #         kitchen_content=product_data['kitchen_content'],
    #         TVA_country=product_data['TVA_country'],
    #         TVA_category=product_data['TVA_category'],
    #         price=product_data['price'],
    #         price2=product_data['price2'],
    #         Xu_class=product_data['Xu_class'],
    #         cid=category.id,
    #         rid=product_data['rid']
    #     )
    #     return None
    # except Exception as e:
    #     return str(e)
    return true