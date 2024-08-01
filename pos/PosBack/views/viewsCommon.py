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

from ..models import product, Test, TestImg, category, printe_to_where, tva, ablist_kitchen_nonull
from ..serializers import ProductSerializer, AllProductSerializer, AllCategorySerializer, CategorySerializer, AllAblistKitchenNonullSerializer
from .utils import delete_image

language = 'English'

@api_view(['POST'])
def update_Xu_class(request):
    try:
        data = request.POST
        Xu_class = data.get('Xu_class', '')
        # rid_received = data.get('rid', '')
        user = request.user
        rid_received = user.id
        category_name = data.get('category_name', '')
        categories = category.objects.filter(
            Q(rid=rid_received) & (
            Q(name=category_name) |
            Q(ename=category_name) |
            Q(lname=category_name) |
            Q(fname=category_name) |
            Q(zname=category_name))
        )

        if not categories.exists():
            return JsonResponse({'status': 'error', 'message': 'No matching categories found.'}, status=404)
        
        category_to_update = categories[0]
        category_to_update.Xu_class = Xu_class
        category_to_update.save()

        products_to_update = product.objects.filter(cid=categories[0].id, rid=rid_received)
        products_to_update.update(Xu_class=Xu_class)

        return JsonResponse({'status': 'success', 'message': 'Xu_class updated successfully.'})

    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)


@api_view(['POST'])
def delete_all(request):
    try:
        # restaurant = request.POST.get('rid', '')
        user = request.user
        restaurant = user.id
        products_to_delete = product.objects.filter(rid = restaurant)
        for product_to_delete in products_to_delete:
            if product_to_delete.img:
                delete_image(product_to_delete.img.path)
        deleted_count_product, _ = products_to_delete.delete()
        categories_to_delete = category.objects.filter(rid = restaurant)
        for category_to_delete in categories_to_delete:
            if category_to_delete.img:
                delete_image(category_to_delete.img.path)
        deleted_count_category, _ = categories_to_delete.delete()

        return JsonResponse({'status': 'success', 'message': f'{deleted_count_product}, {deleted_count_category} products and categories deleted successfully.'})

    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

@api_view(['GET'])
def get_all_ablist_kitchen_nonull(request):
    user = request.user
    rid_recv = user.id
    ablist_kitchen_nonull_data = ablist_kitchen_nonull.objects.all()
    # print(ablist_kitchen_nonull_data)
    serializer = AllAblistKitchenNonullSerializer(ablist_kitchen_nonull_data, many = True)
    return JsonResponse(serializer.data, safe=False)