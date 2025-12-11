from rest_framework import serializers

class PublicLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()