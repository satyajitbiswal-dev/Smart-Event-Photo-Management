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
       
class PhotoBulkUploadSerializer(serializers.ModelSerializer):
    uploaded_photos = serializers.ListField(
        child = serializers.ImageField(allow_empty_file = False,use_url=False),
        write_only = True
    )
    tags = serializers.ListField(
        child = serializers.CharField(max_length=50),
        required = False
    )
    tagged_users = serializers.SlugRelatedField(slug_field='email',queryset=User.objects.all(),many=True,required=False) 
    class Meta:
        model = Photo
        fields = [
            "uploaded_photos",
            "tagged_users",
            "tags"
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
            if created_tags != [] :   photo.tag.add(*created_tags)
            if tagged_users != [] :   photo.tagged_user.add(*tagged_users)

        return created_photos

class PhotoBulkUpdateSerialier(serializers.Serializer):
    photo_ids = serializers.ListField(
        child = serializers.UUIDField(),
        write_only = True
    )
    event = serializers.PrimaryKeyRelatedField(queryset=Event.objects.all(),required=False) #validation checked
    tagged_users = serializers.SlugRelatedField(slug_field='email',queryset=User.objects.all(),many=True,required=False) #validation checked
    is_private = serializers.BooleanField(required = False)
    tags = serializers.ListField(
        child = serializers.CharField(max_length=50),
        required = False
    )

class PhotoDestroySerializer(serializers.Serializer):
    photo_ids = serializers.ListField(
        child = serializers.UUIDField(),
        write_only = True
    )

class PhotoEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            'id',
            'event_name',
            'event_date'
        ]

class PhotoTaggedUsers(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'username',
            'profile_pic',
            'email'
        ]

class PhotoSerializer(serializers.ModelSerializer):
    tag = serializers.SlugRelatedField(slug_field='tag_name',read_only=True, many=True)
    like_count = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    tagged_user = PhotoTaggedUsers(read_only=True, many=True)
    liked_users = serializers.SlugRelatedField(slug_field='email',read_only=True, many=True)
    is_favourite_of = serializers.SlugRelatedField(slug_field='email',read_only=True, many=True)
    class Meta:
        model = Photo
        fields = [
            "photo_id",
            "image_url", 
            "is_private",
            "upload_time_stamp",
            "taken_at",
            "gps_latitude",
            "gps_longitude",
            "camera_model",
            "aperture",
            "shutter_speed",
            "thumbnail",
            "event", 
            "tagged_user", 
            "tag", 
            "like_count", 
            "liked_users",
            'is_favourite_of'
        ]

    def get_image_url(self, obj):
        request = self.context.get("request")
        if request is None:
            return None
        user = request.user
        #If the person is public
        if getattr(user, "role",None) == "P" :
            return request.build_absolute_uri(obj.watermarked_image.url)
        
        #if the person is present in event
        if obj.event.event_members.filter(email=user.email).exists():
            return request.build_absolute_uri(obj.photo.url)
        
        # Admin will get absolute photo url
        if  getattr(user, "role",None) == "A" :
             return request.build_absolute_uri(obj.photo.url)
        # Member / Photographer / Admin
        return request.build_absolute_uri(obj.watermarked_image.url)
    
    def get_like_count(self,obj):
        request = self.context.get("request")
        if request is None:
            return None
        return obj.liked_users.count()

class PhotoListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Photo
        fields = [
            "photo_id",
            "is_private",
            "thumbnail",
        ]



from rest_framework import serializers


class DashboardSummarySerializer(serializers.Serializer):
    total_events = serializers.IntegerField()
    total_photos = serializers.IntegerField()
    total_views = serializers.IntegerField()
    total_likes = serializers.IntegerField()
    total_comments = serializers.IntegerField()
    total_downloads = serializers.IntegerField()


class DashboardEventSerializer(serializers.Serializer):
    event = PhotoEventSerializer()

    photo_count = serializers.IntegerField()
    view_count = serializers.IntegerField()
    like_count = serializers.IntegerField()
    comment_count = serializers.IntegerField()
    download_count = serializers.IntegerField()


class PhotographerDashboardSerializer(serializers.Serializer):
    summary = DashboardSummarySerializer()
    events = DashboardEventSerializer(many=True)


    
