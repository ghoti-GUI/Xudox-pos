from django.contrib.auth.models import Group, User
from rest_framework import serializers
from .models import Test,product

class TestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Test
        fields = ['name']
        # fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = product
        fields = [
            'id_Xu', 
            'online_content',
            'bill_content',
            'kitchen_content', 
            'bill_des',
            # 'allergen_des', 
            'price',
            'price2',
            'time_supply',
            'product_type',
            'cid',
            'print_to_where',
            ]
        # fields = '__all__'


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ['url', 'username', 'email', 'groups']


class GroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Group
        fields = ['url', 'name']