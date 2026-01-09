from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions,generics,authentication
from rest_framework import status
from .models import User
from .serializers import *
from rest_framework.exceptions import PermissionDenied
from django.conf import settings
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import *
from .tasks import *
# Create your views here.
class HomeView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self,request):
        return Response({
            "message":"This is your Home Page Buddy",
        })

home_view = HomeView.as_view()
# Testing of OAuth
def home_view(request):
    context = {
        "client_id":settings.OAUTH_CLIENT_ID,
        "redirect_uri":settings.OAUTH_REDIRECT_URI,
    }
    return render(request,'accounts/oauth.html',context=context)

# get token and generate slug
class UserProfileAPIView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    lookup_field = 'username'
    permission_classes = [AllowAny]
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
    permission_classes = [IsAuthenticated]
    queryset = User.objects.all()
    lookup_field = 'username'
    def get_serializer_class(self, *args, **kwargs):
        if self.request.user.role == 'P':
            return PublicUserSerializer
        return UserSerializer
    
    def get_object(self):
        obj = super().get_object()
        if obj != self.request.user:
           raise PermissionDenied("You cannot view other user's profile")
        return obj

class ListMembers(generics.ListAPIView):
    queryset = User.objects.exclude(role = 'P')
    lookup_field = 'username'
    serializer_class = UserSerializer
    


class ApproveUser(APIView):
    permission_classes = [AllowAny]
    def get(self,request,*args,**kwargs):
        token = request.GET.get("token")
        token_obj = get_object_or_404(Token,token=token)

        if not token_obj.is_valid():
            return Response({"message": "Token invalid or expired"}, status=400)
        
        user = token_obj.user
        user.status = "A" #Accepted
        user.role = 'M'  # Member
        user.save()

        token_obj.is_used = True
        token_obj.save()
        user_join_notification.delay(email=user.email,username=user.username)
        return Response({"message": "User approved successfully"})
    
approve_user = ApproveUser.as_view()
class RejectUser(APIView):
    def get(self,request,*args,**kwargs):
        token = request.GET.get("token")

        token_obj = get_object_or_404(Token, token=token)

        if not token_obj.is_valid():
            return Response({"message": "Token invalid or expired"}, status=400)

        user = token_obj.user
        user.status = "R"
        user.save()

        token_obj.is_used = True
        token_obj.save()

        return Response({"message": "User rejected"})

reject_user = RejectUser.as_view()




class MeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = User.objects.get(id=request.user.id)
        except User.DoesNotExist:
            return Response(status_code=404)

        return Response({
            "email": user.email,
            "username": user.username,
            "role": user.role
        })