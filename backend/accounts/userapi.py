from .models import User
from rest_framework.views import APIView
from .utils import *
from .tasks import send_password
from django.conf import settings
from .serializers import *
from rest_framework.response import Response
from rest_framework import status
from .permissions import GLOBAL_ROLE
from django.utils.crypto import get_random_string
from .permissions import IsAdminUser
from rest_framework import generics

class AddUser(APIView):
    permission_classes = [IsAdminUser]
    def post(self,request,*args,**kwargs):
        serializer = UserCreateSerializer(data = request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data.get('email')
        role = serializer.validated_data.get('role')
        password = passwordgenerator()
        username = generate_username_from_email(email)

        user = User.objects.create_user(email=email,username=username,password=password)
        user.status = 'A'
        user.role = role
        user.save()
        send_password.delay(email=email,password=password,username=username)
        user_data = UserSerializer(user).data
        return Response({
            'message':'User created Successfully',
            'user':user_data
        })
        
add_user = AddUser.as_view()
class RemoveUser(APIView):
    permission_classes = [IsAdminUser]

    def delete(self, request, email, *args, **kwargs):
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        user.delete()
        return Response(
            {"message": "User removed successfully"},
            status=status.HTTP_200_OK
        )

class ListMembers(generics.ListAPIView):
    queryset = User.objects.exclude(role = 'P').filter(status = 'A')
    lookup_field = 'username'
    serializer_class = UserSerializer


class UpdateUserRole(APIView):
    permission_classes=[IsAdminUser]
    def patch(self,request,email,*args,**kwargs):
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        new_role = request.data["role"]
        
        if new_role != 'A' and new_role != 'M':
            return Response(
                {"error": "Enter a valid role"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        #Change diff roles
        user.role = new_role
        user.save()
        user_data = UserSerializer(user).data
        return Response({'message':'User role updated successfully','user':user_data})

update_user_role = UpdateUserRole.as_view()