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

        # response.set_cookie(
        #     key=settings.SIMPLE_JWT['AUTH_COOKIE'],
        #     value=str(refresh.access_token),
        #     expires=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
        #     secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
        #     httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
        #     samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
        # )

        response.set_cookie(
            key=settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'],
            value=str(refresh),
            expires=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'],
            secure=True,
            httponly=True,
            samesite="None"
        )
        # response["X-CSRFToken"] = csrf.get_token(request)
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
            # res.delete_cookie(settings.SIMPLE_JWT['AUTH_COOKIE'])
            res.delete_cookie(settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'])
            # res.delete_cookie("X-CSRFToken")
            # res.delete_cookie("csrftoken")
            # res["X-CSRFToken"]=None

            return res
    
        except:
            raise exceptions.ParseError("Invalid token")


logout_view = LogoutView.as_view()




class OAuthLogin(APIView):
    def channeliauthcallback(request):
        # get authorization code 
        code = request.GET['code']

        # get Access token and refresh token
        token_uri = "https://oauth2.googleapis.com/token "
        try:
            auth_response = requests.post(token_uri,
                                          params = {
                "client_id":  settings.OAUTH_CLIENT_ID,
                'client_secret':settings.OAUTH_CLIENT_SECRET,
                'grant_type':'authorization_code',
                'redirect_uri':settings.OAUTH_REDIRECT_URI,
                'code' :code
            },
            timeout=10)
            auth_response.raise_for_status()
            auth_response_json = auth_response.json()
        except Timeout:
            return Response(
                {"error": "OAuth provider timeout"},
                status=504
            )

        except RequestException as e:
            return Response(
                {"error": "OAuth request failed", "detail": str(e)},
                status=502
            )
        if "error" in auth_response_json:
            return Response(
                {"error": auth_response_json.get("error")},
                status=400
            )
        
        access_token = auth_response_json.get('access_token')
        refresh_token = auth_response_json.get('refresh_token')
        if not access_token:
            return Response(
                {"error": "Access token missing in OAuth response"},
                status=400
            )
        
        #get user data
        get_user_data_url = "https://www.googleapis.com/oauth2/v3/userinfo"
        get_user_data = requests.get(get_user_data_url,headers={
            "Authorization": f"Bearer {access_token}"
        }).json()

        if "error" in get_user_data:
             return Response(
                {"error": get_user_data.get("error")},
                status=400
            )
        
        # name = get_user_data.get("name")
        # email = get_user_data.json().get("email")

        #create a user if not created in database 
        # user = User.objects.filter(email=email).first()
        # if user is None:
        #     user = User.objects.create_user(email=email,name=name)

        # #create a token and give it to user to use it in other apis
        # token,created = Token.objects.get_or_create(user=user)
        # return Response({
        #     'message':'User registered via third party app',
        #     'token':token.key
        # })

oauth_login_view = OAuthLogin.as_view()

