from .models import Photo
from rest_framework import serializers
from apps.event.models import Event
from accounts.models import User
from rest_framework.response import Response

class PhotoBulkUploadSerializer(serializers.ModelSerializer):
    uploaded_photos = serializers.ListField(
        child = serializers.ImageField(allow_empty_file = False,use_url=False),
        write_only = True
    )
    event = serializers.SlugRelatedField(slug_field='event_name',queryset = Event.objects.all())
    class Meta:
        model = Photo
        fields = [
            'event',
            'uploaded_photos'
        ]
    def create(self,validated_data):
        uploaded_photo_list = validated_data.pop("uploaded_photos")
        photos = []
        for uploaded_photo in uploaded_photo_list:
            photos.append(
               Photo(photo=uploaded_photo,**validated_data)
               )
        created_photos = Photo.objects.bulk_create(photos)
        return created_photos

class PhotoDestroySerializer(serializers.Serializer):
    photo_ids = serializers.ListField(
        child = serializers.UUIDField(),
        write_only = True
    )

class PhotoUserTagSerializer(serializers.ModelSerializer):
    event = serializers.SlugRelatedField(slug_field='event_name',queryset=Event.objects.all()) #gives particular event instance
    tagged_users = serializers.SlugRelatedField(slug_field='email',queryset=User.objects.all(),many=True) #gives user instance
    uploaded_photos = serializers.ListField(
        child = serializers.ImageField(allow_empty_file = False,use_url=False),
        write_only = True
    )
    class Meta:
        model = Photo
        fields = [
            'event',
            'uploaded_photos',
            'tagged_users'
        ] 
    
    #when serializer.save() method called in view
    def create(self,validated_data):
        tagged_users = validated_data.pop("tagged_users")
        photos = validated_data.pop("uploaded_photos")
        new_photo=None
        for photo in photos:
            new_photo=Photo.objects.create(photo=photo,**validated_data)
        new_photo.tagged_user.set(tagged_users) #can add check condition for only memeber tagged In
        return new_photo

class PhotoBulkUpdateSerialier(serializers.Serializer):
    photo_ids = serializers.ListField(
        child = serializers.UUIDField(),
        write_only = True
    )
    event = serializers.SlugRelatedField(slug_field='event_name',queryset=Event.objects.all(),required=False) #validation checked
    tagged_users = serializers.SlugRelatedField(slug_field='email',queryset=User.objects.all(),many=True,required=False) #validation checked
    is_private = serializers.BooleanField(required = False)
    # class Meta:
    #     model = Photo
    #     fields = [
    #         'photo_ids',
    #         'event',
    #         'tagged_users',
    #         'is_private'
    #     ]
    
    # def validate_photo_ids(self, instance, validated_data):
    #    uploaded_photo_ids = validated_data
    #    super().update(instance, validated_data)
