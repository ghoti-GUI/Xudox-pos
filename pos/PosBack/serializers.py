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
            'id_user', 
            'price',
            'price2',
            'TVA_country',
            'TVA',
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