from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from .manager import CustomUserManager

# Create your models here.
class User(AbstractUser):
    #Role 
    class UserRole(models.TextChoices):
        PUBLIC = 'P',_('Public')
        MEMBER = 'M',_('IMG_Member')
        ADMIN  = 'A',_('Admin')

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
    profile_pic = models.ImageField(null=True,blank=True)
    batch = models.CharField(max_length=50,null=True,blank=True)  

    is_active = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)  

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    objects = CustomUserManager()

    
