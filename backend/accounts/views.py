from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions,generics,authentication
from rest_framework.authentication import TokenAuthentication
from .models import User
from .serializers import UserSerializer,PublicUserSerializer
from rest_framework.exceptions import PermissionDenied

# Create your views here.
class HomeView(APIView):
    def get(self,request):
        return Response({
            "message":"This is your Home Page Buddy",
        })

home_view = HomeView.as_view()

# get token and generate slug
class UserProfileAPIView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    lookup_field = 'username'
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self, *args, **kwargs):
        if self.request.user.role == 'P':
            return PublicUserSerializer
        return UserSerializer
    
    def get_object(self):
        obj = super().get_object()
        if obj != self.request.user:
           raise PermissionDenied("You cannot view other user's profile")
        return obj


profile_view = UserProfileAPIView.as_view()

class UserProfileUpdateView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    lookup_field = 'username'
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self, *args, **kwargs):
        if self.request.user.role == 'P':
            return PublicUserSerializer
        return UserSerializer
    
    def get_object(self):
        obj = super().get_object()
        if obj != self.request.user:
           raise PermissionDenied("You cannot view other user's profile")
        return obj