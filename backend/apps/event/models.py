from django.db import models
from django.utils import timezone
from accounts.models import User
from django.utils.text import slugify

# Create your models here.
class Event(models.Model):
    event_name = models.CharField(max_length=20,unique=True)
    description = models.TextField(max_length=300,null=True,blank=True)
    date_time = models.DateTimeField(default=timezone.now)
    qr_code = models.ImageField(null=True,blank=True)
    event_coordinator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="coordinated_events")
    event_photographer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="events_as_photographer")
    event_members = models.ManyToManyField(User,related_name="participated_events",null=True,blank=True)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.event_name
    
    def save(self,*args,**kwargs):
        if not self.slug:
            self.slug = slugify(self.event_name)
        super().save(*args,**kwargs)
    class Meta:
        ordering = ["date_time"]