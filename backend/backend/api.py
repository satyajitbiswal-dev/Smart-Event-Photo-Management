# accounts/views.py
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from rest_framework_simplejwt import tokens, views as jwt_views, serializers as jwt_serializers, exceptions as jwt_exceptions



# views.py
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt import serializers as jwt_serializers
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework.response import Response
class CookieTokenRefreshSerializer(jwt_serializers.TokenRefreshSerializer):
    refresh = None  # body se refresh token expect nahi karega

    def validate(self, attrs):
        request = self.context.get("request")
        refresh_token = request.COOKIES.get("refresh_token")

        if not refresh_token:
            raise InvalidToken("No refresh token found in cookie")

        attrs["refresh"] = refresh_token
        return super().validate(attrs)
from rest_framework_simplejwt.views import TokenRefreshView
from django.conf import settings


class CookieTokenRefreshView(TokenRefreshView):
    serializer_class = CookieTokenRefreshSerializer

    def finalize_response(self, request, response, *args, **kwargs):
        # Agar refresh rotate ho raha hai
        refresh_token = response.data.get("refresh_token")

        if refresh_token:
            response.set_cookie(
                key="refresh_token",
                value=refresh_token,
                httponly=True,
                secure=True,        # localhost ke liye False
                samesite="None",      # None tab use karo jab HTTPS ho
                max_age=settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds(),
            )
            del response.data["refresh_token"]

        return super().finalize_response(request, response, *args, **kwargs)
