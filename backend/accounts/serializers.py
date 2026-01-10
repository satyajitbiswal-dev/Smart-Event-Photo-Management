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
            'profile_pic',
            'role',
            'sex',
            'dob'
        ]

class UserUpdateSerializer(serializers.ModelSerializer):
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
            'role',
            'sex',
            'dob'
        ]

class ProfilePicUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
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

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(min_length=8, write_only=True)
    class Meta:
        model = User
        fields = ['email','username','name','password']

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)
    
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)
    
    