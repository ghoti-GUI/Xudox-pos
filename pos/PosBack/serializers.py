from django.contrib.auth.models import Group, User
from rest_framework import serializers
from .models import Test, TestImg, product, category

class TestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Test
        fields = ['name']
        # fields = '__all__'

class TestImgSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestImg
        fields = [
            'content',
            'title', 
            'image',
        ]
        # fields = '__all__'

class AllTestImgSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestImg
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = product
        fields = [
            'id_Xu', 
            # 'online_content',
            'bill_content',
            'kitchen_content', 
            # 'online_des',
            'color', 
            'text_color', 
            'price',
            'price2',
            'time_supply',
            # 'product_type',
            'cid',
            'print_to_where',
            'img',
            # 'allergen', 
            # 'discount', 
            'online_content',
            'online_des',
            'Xu_class',
            'rid', 
            ]
        # fields = '__all__'

class AllProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = product
        fields = '__all__'


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = category
        fields = [
            'name',
            'des',
            'color',
            'text_color', 
            'time_supply',
            'img', 
            'Xu_class', 
            'rid', 
        ]

class AllCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = category
        fields = '__all__'


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ['url', 'username', 'email', 'groups']


class GroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Group
        fields = ['url', 'name']