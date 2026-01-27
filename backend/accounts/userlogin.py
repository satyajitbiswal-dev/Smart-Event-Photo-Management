from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .utils import verify_otp,generate_and_send_otp
from requests.exceptions import RequestException,Timeout
import requests
from .serializers import *
from rest_framework.authtoken.models import Token
from .models import *
from django.contrib.auth import authenticate
from django.conf import settings
from rest_framework.permissions import AllowAny, IsAuthenticated
from .tasks import *
from datetime import timedelta
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from django.middleware import csrf
from rest_framework import exceptions
from .utils import *

class UserRegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self,request,*args,**kwargs):
        serializer = UserRegisterSerializer(data = request.data)
        serializer.is_valid(raise_exception=True)
        # check if the user already existed tell that an user is already in db
        email = serializer.validated_data["email"]
        existing_user = User.objects.filter(email=email).first()
        if existing_user:
            return Response(
                serializer.errors or
                {
                    "message": "User already signed up. Go to login.",
                    "status": existing_user.status
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        #if the user is not existed create a new user , send mail to admin , after admin accept 
        user = serializer.save()
        if user:
            approval_token = Token.objects.create(
                    user=user,
                    expires_at=timezone.now() + timedelta(hours=24)
                )
            send_confirmation_message_admin.delay(email=email,approval_token_id=approval_token.id)
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self,request,*args,**kwargs):
        serializer = LoginSerializer(data = request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data.get('email')
        password = serializer.validated_data.get('password')
        user = authenticate(request,email=email,password=password)
        if user is None:
            return Response({'message':'wrong Credentials'},status=status.HTTP_401_UNAUTHORIZED)
        if user.status == 'P':
            return Response({'message' : "Your request is still pending at Admin side."},status=status.HTTP_403_FORBIDDEN)
        if user.status == 'R':
            return Response({'message' : "Your request is rejected by Admin."},status=status.HTTP_403_FORBIDDEN)
        if user.role == 'P':
            return Response({'message' : "You must be a member or Admin to be part of this club."},status=status.HTTP_403_FORBIDDEN)
        generate_and_send_otp(email=email)
        return Response({
            'message':'OTP generated successfully'
        },status=status.HTTP_200_OK)
    
login_otp_send = LoginView.as_view()

class VerifyOTP(APIView):
    permission_classes = [AllowAny]
    def post(self,request,*args,**kwargs):
        email = request.data.get("email")
        otp = request.data.get("otp")
        if not email and not otp:
            return Response({"message": "Email and OTP are required"},status=status.HTTP_400_BAD_REQUEST)
        if not verify_otp(email, otp):
            return Response({"message": "Invalid OTP"},status=status.HTTP_401_UNAUTHORIZED)
            #check if user exits 
        user = User.objects.filter(email=email).first()
        if not user:
            return Response({"message": "User not found"},status=status.HTTP_404_NOT_FOUND)
                
        refresh = RefreshToken.for_user(user=user)
        response = Response({
            "message": "LoggedIn successfully",
            "access_token": str(refresh.access_token) ,
            "email": user.email,
            "username": user.username ,
            "role": user.role ,
        },status=status.HTTP_200_OK)

        response.set_cookie(
            key=settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'],
            value=str(refresh),
            expires=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'],
            secure=True,
            httponly=True,
            samesite="None"
        )
        return response
        
         
otp_verify = VerifyOTP.as_view()

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        try:
            refreshToken = request.COOKIES.get(
                settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'])
            token = RefreshToken(refreshToken)
            token.blacklist()

            res = Response(
                {"message":"Logged Out Successfully"}
            )
            res.delete_cookie(settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'])

            return res
    
        except:
            raise exceptions.ParseError("Invalid token")


logout_view = LogoutView.as_view()
class ResetPasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        password = request.data.get("password")
        confirm_password = request.data.get("confirm_password")

        if not password or not confirm_password:
            return Response(
                {"message": "Both fields are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if password != confirm_password:
            return Response(
                {"message": "Passwords do not match"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(password)
        user.save()

        return Response(
            {"message": "Password reset successful"},
            status=status.HTTP_200_OK
        )

# views.py
 # your function


class ForgotPasswordView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        email = request.data.get("email")

        if not email:
            return Response(
                {"message": "Email is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"message": "If this email exists, a password has been sent"},
                status=status.HTTP_200_OK
            )

        # internal rule, but response same
        if user.status != 'A':
            return Response({
                "message": "If this email exists, a password has been sent"
                }, status=status.HTTP_200_OK )


        new_password = passwordgenerator()

        user.set_password(new_password)
        user.save()

        # send email async
        send_forgot_password_email.delay(email, new_password)

        return Response(
            {"message": "Password sent to your email"},
            status=status.HTTP_200_OK
        )
