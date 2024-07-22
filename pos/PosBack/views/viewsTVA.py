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

@api_view(['GET'])
def get_TVA(request):
    # request_language = request.query_params.get('language', '')
    request_language='English'
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






