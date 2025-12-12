from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'username',
            'name',
            'email',
            'enrollment',
            'bio',
            'department',
            'batch',
            'profile_pic'
        ]

class PublicUserSerializer(serializers.ModelSerializer):
    class Meta:
        models = User
        fields = [
            'username',
            'name',
            'email',
            'profile_pic'
        ]
class PublicLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()

class UserCreateSerializer(serializers.ModelSerializer):
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

class EmailPasswordLoginSerializer(serializers.Serializer):
   email = serializers.EmailField()
   password = serializers.CharField()