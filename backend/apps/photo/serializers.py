from .models import Photo,Tag
from rest_framework import serializers
from apps.event.models import Event
from accounts.models import User
from rest_framework.response import Response

def normalize_tag(tag):
    tag = tag.casefold()
    tag = tag.strip()
    return tag
class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['tag_name']
    # def validate_tag_name(self,value):
    #     

class PhotoBulkUploadSerializer(serializers.ModelSerializer):
    uploaded_photos = serializers.ListField(
        child = serializers.ImageField(allow_empty_file = False,use_url=False),
        write_only = True
    )
    event = serializers.SlugRelatedField(slug_field='event_name',queryset = Event.objects.all())
    # tags = TagSerializer(many=True,required=False) frontend mai jab json bhejunga that time see
    tags = serializers.ListField(
        child = serializers.CharField(max_length=50),
        required = False
    )
    tagged_users = serializers.SlugRelatedField(slug_field='email',queryset=User.objects.all(),many=True,required=False) 
    class Meta:
        model = Photo
        fields = [
            'event',
            'uploaded_photos',
            'tags',
            'tagged_users'
        ]
    def create(self,validated_data):
        uploaded_photo_list = validated_data.pop("uploaded_photos")
        if validated_data.get("tags"): tags = validated_data.pop("tags") 
        else: tags = []
        tagged_users = validated_data.pop("tagged_users") 
        photos = []
        for uploaded_photo in uploaded_photo_list:
            photos.append(
               Photo(photo=uploaded_photo,**validated_data)
               )
        created_photos = Photo.objects.bulk_create(photos)
        # create tags or get tags and assign
        created_tags = []
        for tag in tags:
            tag = normalize_tag(tag)
            tag_instance = Tag.objects.get_or_create(tag_name=tag)[0]
            created_tags.append(tag_instance)
        for photo in created_photos:
            if created_tags != [] :   photo.tag.set(created_tags)
            if tagged_users != [] :   photo.tagged_user.set(tagged_users)

        return created_photos

class PhotoBulkUpdateSerialier(serializers.Serializer):
    photo_ids = serializers.ListField(
        child = serializers.UUIDField(),
        write_only = True
    )
    event = serializers.SlugRelatedField(slug_field='event_name',queryset=Event.objects.all(),required=False) #validation checked
    tagged_users = serializers.SlugRelatedField(slug_field='email',queryset=User.objects.all(),many=True,required=False) #validation checked
    is_private = serializers.BooleanField(required = False)
    

class PhotoDestroySerializer(serializers.Serializer):
    photo_ids = serializers.ListField(
        child = serializers.UUIDField(),
        write_only = True
    )

