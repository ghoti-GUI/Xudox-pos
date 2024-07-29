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
from ..serializers import TestSerializer, TestImgSerializer, AllTestImgSerializer, ProductSerializer, AllProductSerializer, AllCategorySerializer, CategorySerializer, AllPrinterSerializer, GroupSerializer, UserSerializer

language = 'English'

# fetch printer for add product form (strange data form)
@api_view(['GET'])
def get_printer(request):
    # rid_recv = request.query_params.get('rid')
    user = request.user
    rid_recv = user.id
    printers = printe_to_where.objects.filter(rid=rid_recv)
    printerData = {printer.id_printer:printer.printer for printer in printers}
    return JsonResponse(printerData)

@api_view(['GET'])
def get_all_printer(request):
    # rid_recv = request.query_params.get('rid')
    user = request.user
    rid_recv = user.id
    printers = printe_to_where.objects.filter(rid=rid_recv)
    serializer = AllPrinterSerializer(printers, many = True)
    return JsonResponse(serializer.data, safe=False)

@api_view(['GET'])
def get_printers_by_id(request):
    printers_id_group = request.query_params.get('printers_id', '')
    # rid_recv = request.query_params.get('rid')
    user = request.user
    rid_recv = user.id
    printers_id = str(printers_id_group)
    printers_data = []
    for printer_id in printers_id:
        printer = get_object_or_404(printe_to_where, Q(id=printer_id) & Q(rid=rid_recv))
        printers_data.append(printer.printer)
    return JsonResponse(printers_data, safe = False)


