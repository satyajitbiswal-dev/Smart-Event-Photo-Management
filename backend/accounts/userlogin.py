from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .utils import send_otp,verify_otp
from .serializers import PublicLoginSerializer,EmailPasswordLoginSerializer
from rest_framework.authtoken.models import Token
from .models import User
from django.contrib.auth import authenticate

class SendOTP(APIView):
    def post(self,request,*args,**kwargs):
        serializer = PublicLoginSerializer(data = request.data)
        if serializer.is_valid():
            email = serializer.validated_data.get('email')
            send_otp(email)
            return Response({
                'message':'OTP sent successfully',
                'status':status.HTTP_200_OK
            })
        return Response({
            'message':'Wrong Credentials or OTP cannot be generated',
            'status':status.HTTP_400_BAD_REQUEST
        })
    
otp_send = SendOTP.as_view()

class VerifyOTP(APIView):
    def post(self,request,*args,**kwargs):
        email = request.data.get("email")
        otp = request.data.get("otp")
        if not email and not otp:
            return ValueError("Please enter a valid email and otp")
        
        if(verify_otp(email,otp)):
            #check if user exits otherwise create a public user
            user = User.objects.filter(email=email).first()
            if user is None:
                user = User.objects.create_public_user(email=email)
            user.is_active = True
            #create or get authentication token for user(for starting practice I have used django Token)
            token,created = Token.objects.get_or_create(user=user)
            return Response({
                'token':token.key,
                'status':status.HTTP_200_OK
            })
        
        return Response({
            'message':'Wrong credentials',
            'status':status.HTTP_400_BAD_REQUEST
        })
    
otp_verify = VerifyOTP.as_view()

class MemberLogin(APIView):
    def post(self,request,*args,**kwargs):
        serializer = EmailPasswordLoginSerializer(data = request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data.get('email')
        password = serializer.validated_data.get('password')
        user = authenticate(request,email=email,password=password)
        if user is None:
            return Response({'message':'wrong Credentials'},status=400)
        
        token,created = Token.objects.get_or_create(user=user)
        return Response({
            'message':'You are login Successfully',
            'token':token.key
        })

member_login = MemberLogin.as_view()

