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
from .serializers import TestSerializer, ProductSerializer, GroupSerializer, UserSerializer


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