from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from .manager import CustomUserManager
import uuid
from django.utils import timezone

# Create your models here.
class User(AbstractUser):
    #Role 
    class UserRole(models.TextChoices):
        PUBLIC = 'P',_('Public')
        MEMBER = 'M',_('IMG_Member')
        ADMIN  = 'A',_('Admin')

    class UserJoin(models.TextChoices):
        ACCEPTED = 'A', _('Accepted')
        REJECTED = 'R', _('Rejected')
        PENDING = 'P', _('Pending')
    class Sex(models.TextChoices):
        MALE = 'M', _('Male')
        FEMALE = 'F', _('Female')

    #For every User whether Public or Member
    email = models.EmailField(_('email address'),unique=True,blank=False)
    username = models.CharField(max_length=150,unique=True) #created from email at the time of registration
    role = models.CharField(
        max_length=1,
        choices=UserRole.choices,
        default=UserRole.PUBLIC
    )
    name = models.CharField(max_length=100,null=True,blank=True)

    #extra fields for members and Admin
    enrollment = models.CharField(max_length=8,blank=True,null=True)
    department = models.CharField(max_length=50,blank=True,null=True)
    bio = models.TextField(max_length=300,null=True,blank=True)
    # profile_pic = models.ImageField(null=True,blank=True)
    profile_pic = models.ImageField(upload_to='profiles/', null=True,blank=True, default="profiles/default.png")
    batch = models.CharField(max_length=50,null=True,blank=True)  
    status =  models.CharField(
        max_length=1,
        choices=UserJoin.choices,
        default=UserJoin.PENDING
    )
    sex = models.CharField(
        max_length=1,
        choices=Sex.choices,
        null=True, blank=True
    )
    dob = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True) 
    is_staff = models.BooleanField(default=False)  

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username","name"]

    objects = CustomUserManager()

    
class Token(models.Model):
    token = models.UUIDField(default=uuid.uuid4, unique=True)
    user = models.ForeignKey("User", on_delete=models.CASCADE)
    is_used = models.BooleanField(default=False)
    expires_at = models.DateTimeField()

    def is_valid(self):
        return (not self.is_used) and self.expires_at > timezone.now()