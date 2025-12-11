from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User
from rest_framework.views import APIView
from .utils import send_password,passwordgenerator
from django.conf import settings
from .serializers import UserSerializer,EmailRoleSerializer, PublicLoginSerializer
from rest_framework.response import Response
from rest_framework import status
from .permissions import GLOBAL_ROLE

admin.site.register(User,UserAdmin)

#add User manual (Member and Public) to the app
class AddUser(APIView):
    def post(self,request,*args,**kwargs):
        serializer = UserSerializer(data = request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data.get('email')
        role = serializer.validated_data.get('role')

        password = passwordgenerator()
        if role == 'P':
            User.objects.create_public_user(email=email)
        elif role == 'M':
            User.objects.create_user(email=email,password=password)
            send_password(email,password)
        elif role == 'A':
            username = email.split('@')[0]
            User.objects.create_superuser(email=email,password=password,username=username)
            send_password(email,password)
        return Response({
            'message':'User created Successfully',
            'status':status.HTTP_200_OK
        })
        
add_user = AddUser.as_view()

class GetUserRole(APIView):
    def post(self,request,*args,**kwargs):
        serializer = PublicLoginSerializer(data = request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data.get('email')
        user = User.objects.filter(email=email).first()
        if user is None:
            return Response({'message':'No User Exists'})
        return Response({'messaage':f'The role of user is {user.role}'})

get_user_role = GetUserRole.as_view()

class UpdateUserRole(APIView):
    def post(self,request,*args,**kwargs):
        serializer = EmailRoleSerializer(data = request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data.get('existing_mail')
        new_role = serializer.validated_data.get('role')
        #get user
        user = User.objects.filter(email=email).first()
        if user is None:
            return Response({"message":"User does not exist"})
        
        #Change diff roles
        user.role = new_role
        status=GLOBAL_ROLE[new_role]
        for attr, val in status.items():
            setattr(user, attr, val)

        if new_role == 'M' or new_role == 'A':
            password = passwordgenerator()
            user.set_password(password)
            send_password(email,password)
        else:
            user.set_unusable_password()

        user.save()
        return Response({'message':'User role updated successfully'})

update_user_role = UpdateUserRole.as_view()