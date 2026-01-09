from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User
from rest_framework.views import APIView
from .utils import send_password,passwordgenerator
from django.conf import settings
from .serializers import *
from rest_framework.response import Response
from rest_framework import status
from .permissions import GLOBAL_ROLE
from django.utils.crypto import get_random_string
from .permissions import IsAdminUser

admin.site.register(User,UserAdmin)

#add User manual (Member and Public) to the app
class AddUser(APIView):
    permission_classes = [IsAdminUser]
    def post(self,request,*args,**kwargs):
        serializer = UserCreateSerializer(data = request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data.get('email')
        role = serializer.validated_data.get('role')

        password = passwordgenerator()
        if role == 'P':
            User.objects.create_user(email=email)
        else:
            User.objects.create_user(email=email,role=role,password=password)
            send_password(email,password)
        return Response({
            'message':'User created Successfully',
            'status':status.HTTP_200_OK
        })
        
add_user = AddUser.as_view()

# class GetUserRole(APIView):
#     def post(self,request,*args,**kwargs):
#         serializer = PublicLoginSerializer(data = request.data)
#         serializer.is_valid(raise_exception=True)
#         email = serializer.validated_data.get('email')
#         user = User.objects.filter(email=email).first()
#         if user is None:
#             return Response({'message':'No User Exists'})
#         return Response({'messaage':f'The role of user is {user.role}'})

# get_user_role = GetUserRole.as_view()

# class UpdateUserRole(APIView):
#     def post(self,request,*args,**kwargs):
#         serializer = EmailRoleSerializer(data = request.data)
#         serializer.is_valid(raise_exception=True)

#         email = serializer.validated_data.get('existing_mail')
#         new_role = serializer.validated_data.get('role')
#         #get user
#         user = User.objects.filter(email=email).first()
#         if user is None:
#             return Response({"message":"User does not exist"})
        
#         #Change diff roles
#         user.role = new_role
#         if new_role == 'M' or new_role == 'A':
#             password = passwordgenerator()
#             user.set_password(password)
#             send_password(email,password)
#         else:
#             user.set_unusable_password()

#         user.save()
#         return Response({'message':'User role updated successfully'})

# update_user_role = UpdateUserRole.as_view()