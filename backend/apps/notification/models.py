from django.db import models
from accounts.models import User

# Create your models here.
class Notification(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    text_message = models.TextField(max_length=120)
    send_time = models.DateTimeField(auto_now_add=True)
    is_seen = models.BooleanField(default=False)

    def __str__(self):
        return f"Notification for{self.user.username} : {self.message}"