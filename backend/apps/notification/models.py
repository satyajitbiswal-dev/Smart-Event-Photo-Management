from django.db import models
from accounts.models import User
from apps.photo.models import *

# Create your models here.
class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    text_message = models.TextField(max_length=200)
    send_time = models.DateTimeField(auto_now_add=True)
    is_seen = models.BooleanField(default=False)
    type = models.CharField(max_length=120, null=True, blank=True)
    photo = models.ForeignKey(Photo, blank=True, null=True, on_delete=models.CASCADE)
    comment = models.ForeignKey(Comment,blank=True,null=True,on_delete=models.CASCADE)
    event = models.ForeignKey(Event,blank=True,null=True,on_delete=models.CASCADE)
    # type_id = models.UUIDField()

    def __str__(self):
         return f"Notification for {self.user.username}: {self.text_message}"