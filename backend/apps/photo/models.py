from django.db import models
from django.utils import timezone
# from event.models import Event
import uuid
from apps.event.models import Event
from accounts.models import User
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
    tagged_user = models.ManyToManyField(User,null=True,blank=True,related_name="tagged_In")
    tag = models.ManyToManyField(Tag,blank=True,related_name="related_photos")

    class Meta:
        ordering = [
            "-taken_at",
            "-upload_time_stamp"
        ]


