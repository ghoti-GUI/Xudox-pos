from django.shortcuts import render, get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, JsonResponse
from django.template import loader
from django.contrib.auth.models import Group, User
from django.db.models import Max
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from rest_framework import permissions, viewsets
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action, api_view
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django.conf import settings
import json
import requests
import os

from ..models import site_wide_discount
from ..serializers import AllSiteWideDiscountSerializer
from .utils import delete_image

language = 'English'

class SwDiscountViewSet(viewsets.ModelViewSet):
    queryset = site_wide_discount.objects.all()
    serializer_class = AllSiteWideDiscountSerializer
    # permission_classes = [permissions.AllowAny]  # 开发阶段允许任何人访问
    permission_classes = (IsAuthenticated, )

    def perform_create(self, serializer):
        request_data = serializer.initial_data
        user_id = self.request.user.id
        save_data = {'rid':user_id}
        serializer.save(**save_data)


@api_view(['GET'])
def get_all_sw_discounts(request):
    user = request.user
    rid_received = user.id
    if rid_received:
        discounts = site_wide_discount.objects.filter(rid = rid_received)
        serializer = AllSiteWideDiscountSerializer(discounts, many = True)
        return JsonResponse(serializer.data, safe = False)
    else:
        return JsonResponse({'message': 'Invalid credentials'}, status=401)


@api_view(['POST'])
def update_sw_discount_by_id(request):
    try:
        data = request.POST
        id_received = data.get('id', '')
        user = request.user
        rid_received = user.id
        if rid_received:
            discount_to_update = get_object_or_404(site_wide_discount, Q(id=id_received) & Q(rid=int(rid_received)))
            for key, value in data.items():
                if key!='id' and key!='rid':  # 确保不修改 id
                    if hasattr(discount_to_update, key):
                        setattr(discount_to_update, key, value)
            discount_to_update.save()
            return JsonResponse({'status': 'success', 'message': 'Discount updated successfully.'})
        else:
            return JsonResponse({'message': 'Invalid credentials'}, status=401)

    except site_wide_discount.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Discount not found.'}, status=404)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)


@api_view(['POST'])
def delete_sw_discount(request):
    try:
        id_recv = request.POST.get('id')
        user = request.user
        rid_recv = user.id
        if rid_recv:
            discount_to_delete = get_object_or_404(site_wide_discount, Q(id=id_recv) & Q(rid=rid_recv))
            discount_to_delete.delete()
            return JsonResponse({'status': 'success', 'message': f'discount {id_recv} deleted successfully.'})
        else:
            return JsonResponse({'message': 'Invalid credentials'}, status=401)

    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)