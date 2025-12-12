from django.db import models
from django.utils import timezone
from accounts.models import User

# Create your models here.
class Event(models.Model):
    event_name = models.CharField(max_length=20,unique=True)
    description = models.TextField(max_length=300,null=True,blank=True)
    date_time = models.DateTimeField(default=timezone.now)
    qr_code_url = models.TextField(null=True,blank=True)
    event_coordinator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="coordinated_events")
    event_photographer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="events_as_photographer")
    event_members = models.ManyToManyField(User,related_name="participated_events")

    def __str__(self):
        return self.event_name

    class Meta:
        ordering = ["date_time"]