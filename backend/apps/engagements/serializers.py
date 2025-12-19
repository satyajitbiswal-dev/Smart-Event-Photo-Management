from rest_framework import serializers
from apps.photo.models import Photo,Like

class PhotoLikeSerializer(serializers.Serializer):
    photo_id = serializers.PrimaryKeyRelatedField(queryset=Photo.objects.all())
    