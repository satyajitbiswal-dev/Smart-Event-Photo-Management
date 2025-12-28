from django.db import models
from django.utils import timezone
from accounts.models import User
from django.utils.text import slugify
import uuid
from django.urls import reverse

# Create your models here.
class Event(models.Model):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True,editable=False)
    event_name = models.CharField(max_length=50)
    description = models.TextField(max_length=300,null=True,blank=True)
    event_date = models.DateField()
    event_time = models.TimeField(blank=True, null=True)
    qr_code = models.ImageField(upload_to="qr_codes/",null=True,blank=True)
    event_coordinator = models.ForeignKey(User, on_delete=models.SET_NULL, related_name="coordinated_events",null=True) 
    event_photographer = models.ForeignKey(User, on_delete=models.SET_NULL, related_name="events_as_photographer", null=True) 
    event_members = models.ManyToManyField(User,related_name="participated_events",blank=True)
    slug = models.SlugField(editable=False)

    def __str__(self):
        return self.event_name
    
    def save(self,*args,**kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.event_name}-{self.event_date.year}")
        super().save(*args,**kwargs)
    class Meta:
        ordering = ["-event_date"]
        #add some unique constraint buddy

    def get_absolute_url(self):
        return reverse('event-details',kwargs={"id":self.id})