from django.db import models
from django.utils import timezone
import uuid
from apps.event.models import Event
from accounts.models import User
from django.contrib.postgres.search import SearchVectorField
from django.utils.translation import gettext_lazy as _

# Create your models here.
class Tag(models.Model):
    tag_name = models.CharField(max_length=50, unique=True)

class Photo(models.Model):
    photo_id = models.UUIDField(default=uuid.uuid4, primary_key=True,editable=False)
    photo = models.ImageField(upload_to="photos/")
    is_private = models.BooleanField(default=False)

    upload_time_stamp = models.DateTimeField(auto_now_add=True)
    taken_at = models.DateTimeField(null=True, blank=True)
    #exif data
    gps_latitude = models.FloatField(null=True,blank=True)
    gps_longitude = models.FloatField(null=True,blank=True)
    camera_model = models.CharField(max_length=100,null=True,blank=True)
    aperture = models.CharField(max_length=100,null=True,blank=True)
    shutter_speed = models.CharField(max_length=100,null=True,blank=True)
    
    thumbnail = models.ImageField(upload_to="thumbnails/", null=True, blank=True)
    watermarked_image = models.ImageField(upload_to="watermark/",null=True,blank=True)
    
    event = models.ForeignKey(Event,on_delete=models.CASCADE,related_name="photos")

    tagged_user = models.ManyToManyField(User,blank=True,related_name="tagged_In",through='TaggedUser')
    tag = models.ManyToManyField(Tag,blank=True,related_name="related_photos")
    liked_users = models.ManyToManyField(User,related_name='liked_photos',through='Like',blank=True)
    is_favourite_of = models.ManyToManyField(User,related_name='favourite_photos',through='Favourite',blank=True)

    view_count = models.PositiveIntegerField(default=0)
    downloaded = models.ManyToManyField(User,related_name='downloaded_photos',blank=True,through='PhotoDownload')

    search_field = SearchVectorField(null=True)
    class Meta:
        ordering = [
            "-upload_time_stamp",
            "-taken_at"
        ]


class Like(models.Model):
    like_id = models.UUIDField(default=uuid.uuid4,primary_key=True,editable=False,unique=True)
    photo = models.ForeignKey(Photo,on_delete=models.CASCADE)
    user  = models.ForeignKey(User,on_delete=models.CASCADE)
    like_time_stamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "photo"],
                name="unique_user_photo_like"
            )
        ]
        ordering = [
            "-like_time_stamp"
        ]

class Favourite(models.Model):
    fav_id = models.UUIDField(default=uuid.uuid4,primary_key=True,editable=False,unique=True)
    photo = models.ForeignKey(Photo,on_delete=models.CASCADE)
    user  = models.ForeignKey(User,on_delete=models.CASCADE)
    add_to_fav_time_stamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "photo"],
                name="unique_user_photo_fav"
            )
        ]
        ordering = [
            "-add_to_fav_time_stamp"
        ]

class TaggedUser(models.Model):
    tag_id = models.UUIDField(default=uuid.uuid4,primary_key=True,editable=False,unique=True)
    photo = models.ForeignKey(Photo,on_delete=models.CASCADE)
    user  = models.ForeignKey(User,on_delete=models.CASCADE)
    tag_time_stamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "photo"],
                name="unique_user_photo_tag"
            )
        ]
        ordering = [
            "-tag_time_stamp"
        ]



class Comment(models.Model):
    id = models.UUIDField(default=uuid.uuid4,primary_key=True,editable=False,unique=True)
    photo = models.ForeignKey(Photo, on_delete=models.CASCADE, related_name='comments')
    parent_comment = models.ForeignKey('Comment', on_delete=models.CASCADE, related_name="replies", null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="comments")
    body = models.TextField(max_length=300)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = [
            "-created"
        ]
    

class PhotoDownload(models.Model):
    DOWNLOAD_TYPE_CHOICES = [
        ("original", "Original"),
        ("watermarked", "Watermarked"),
    ]

    photo = models.ForeignKey(Photo,on_delete=models.CASCADE)
    user  = models.ForeignKey(User,on_delete=models.CASCADE)
    downloaded_at = models.DateTimeField(auto_now_add=True)
    download_type = models.CharField(
        max_length=11,
        choices=DOWNLOAD_TYPE_CHOICES
    )

    class Meta:
        indexes = [
            models.Index(fields=["user", "download_type", "downloaded_at"]),
        ]
        ordering = [
            "downloaded_at"
        ]
