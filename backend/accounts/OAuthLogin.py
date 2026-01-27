from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
from django.shortcuts import redirect
import requests
from requests.exceptions import RequestException, Timeout
from .models import User
# from rest_framework.authtoken.models import Token
from .tasks import *
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from datetime import timedelta
from django.utils import timezone
from .models import Token

class OAuthLogin(APIView):
    def get(self, request):
        code = request.GET.get("code")
        if not code:
            return Response({
                "error": "Authorization code missing"},
                status=400)

        #  Exchange code for token
        try:
            token_response = requests.post(
                settings.OMNIPORT_TOKEN_URL,
                data={
                    "client_id": settings.OMNIPORT_CLIENT_ID,
                    "client_secret": settings.OMNIPORT_CLIENT_SECRET,
                    "grant_type": "authorization_code",
                    "redirect_uri": settings.OMNIPORT_REDIRECT_URI,
                    "code": code,
                },
                timeout=10
            )
            token_response.raise_for_status()
            token_data = token_response.json()

        except Timeout:
            return Response({"error": "Omniport timeout"}, status=504)

        except RequestException as e:
            return Response({
                "error": "Token exchange failed", "detail": str(e)},
                status=502
            )

        if "error" in token_data:
            return Response(token_data, status=400)

        access_token = token_data.get("access_token")

        if not access_token:
            return Response({"error": "Access token missing"}, status=400)

        # Get user data
        user_response = requests.get(
            settings.OMNIPORT_USER_URL,
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=10)

        if user_response.status_code != 200:
            return Response(
                {"error": "Failed to fetch user data"},
                status=401
            )

        user_data = user_response.json()
        email = user_data.get("contactInformation", {}).get("instituteWebmailAddress" )
        full_name = user_data.get("person", {}).get("fullName")

        if not email:
            return Response(
                {"error": "Email not found in Omniport response"},
                status=400
            )

        #  DB logic
        user = User.objects.filter(email=email).first()

        # User not exists → create PENDING
        if not user:
            user = User.objects.create_oauth_user(data={
                    "email": email,
                    "name": full_name,
                    "enrollment": user_data.get("student", {}).get("enrolmentNumber"),
                    "department": user_data.get("student", {}).get("branch",{}).get("name"),
                },
                role="P"
            )
            approval_token = Token.objects.create(
                    user=user,
                    expires_at= timezone.now() + timedelta(hours=24)
                )

            send_confirmation_message_admin_oauth.delay(email=email, approval_token_id=approval_token.id ) #issme thodi dekh
            return Response({
                "message": "Approval pending from admin"},
                status=202
            )
        # Existing user checks
        else:
            if user.status == "P":
                return Response(
                    {"message": "Your account approval is pending"},
                    status=403
                )

            if user.status == "R":
                return Response(
                    {"message": "Your account has been rejected"},
                    status=403
                )

            if user.status == "A":
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

        return Response(
            {"error": "Invalid user status"},
            status=400
        )
