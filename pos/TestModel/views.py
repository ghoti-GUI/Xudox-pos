from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse
from django.template import loader
from django.contrib.auth.models import Group, User
from rest_framework import permissions, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action

from .models import product, Test
from .serializers import TestSerializer, GroupSerializer, UserSerializer

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

    # @action(detail=False, methods=['POST'])
    # def add_book(self, request):
    #     # Get the data from the request
    #     data = request.data
    #     # Modify the data as needed
    #     data['des'] = 'testdes_autofill'
    #     # Serialize the data
    #     serializer = self.get_serializer(data=data)
    #     if serializer.is_valid():
    #         # Save the data to the database
    #         serializer.save()
    #         return Response(serializer.data)
    #     else:
    #         return Response(serializer.errors, status=400)



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








def index(request):
    product_list = product.objects.order_by("id")[:5]
    template = loader.get_template("index.html")
    context = {
        'product_list': product_list,
    }
    # return HttpResponse(template.render(context, request))
    return render(request, 'index.html', context)

    # output = ", ".join([p.zname for p in product_list])
    # return HttpResponse(output)


def detail(request, product_id):
    product_item = get_object_or_404(product, pk = product_id)
    return render(request, "detail.html", {"product":product_item.zname})


def results(request, product_id):
    response = "You're looking at the results of product %s."
    return HttpResponse(response % product_id)


def vote(request, product_id):
    return HttpResponse("You're voting on product %s." % product_id)
