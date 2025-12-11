from rest_framework import serializers
from .models import User

class PublicLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields=[
            'email','role'
        ]

class EmailRoleSerializer(serializers.ModelSerializer):
    existing_mail = serializers.EmailField()
    class Meta:
        model = User
        fields = [
            'existing_mail','role'
        ]