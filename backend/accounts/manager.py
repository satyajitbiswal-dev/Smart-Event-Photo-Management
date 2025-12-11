from django.contrib.auth.models import UserManager
from django.utils.translation import gettext_lazy as _
from .utils import passwordgenerator

class CustomUserManager(UserManager):
    #Members Only
    def create_user(self,email, username = None, password = None , **extra_fields):
        if not email:
            raise ValueError(_('You must provide an email in order to Login'))
        
        email = self.normalize_email(email)

        if username is None:
            username = email.split("@")[0]
        
        extra_fields.setdefault('is_staff',True)
        extra_fields.setdefault('is_superuser',False)
        extra_fields.setdefault('is_active',True)

        user = self.model(email=email,username=username,role='M', **extra_fields)
        if password is None:
            password = passwordgenerator()
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    #Public Only
    def create_public_user(self,email,username=None,**extra_fields):
        if not email:
            raise ValueError(_('You must provide an email in order to Login'))
        
        email = self.normalize_email(email)

        if username is None:
            username = email.split("@")[0]
        
        extra_fields.setdefault('is_staff',False)
        extra_fields.setdefault('is_superuser',False)
        extra_fields.setdefault('is_active',False)
        user = self.model(email=email,username=username,role = 'P',**extra_fields)
        
        user.set_unusable_password()   
        user.save(using=self._db)
        return user


    #OAuth Login->It may be member or may be Public
    def create_oauth_user(self,data,role='P',password=None,**extra_fields):
        email = data.get("email") or None
        if not email:
            raise ValueError(_('You must provide an email in order to Login'))
        email = self.normalize_email(email)
        username = data.get("name") or  email.split("@")[0]
        enrollment = data.get("enrollment") or None
        department = data.get("department") or None

        extra_fields.setdefault('is_staff',False)
        extra_fields.setdefault('is_superuser',False)
        extra_fields.setdefault('is_active',False)
        user = self.model(email=email,
                          username=username,
                          enrollment=enrollment ,
                          department = department,
                          role = role,
                          **extra_fields)
        
        if role == 'M' and password is not None:
            user.set_password(password)
        else:
            user.set_unusable_password() 
        user.save(using=self._db)
        return user
    

    #Admin SignUp
    def create_superuser(self,  email, password ,username, **extra_fields):
        extra_fields.setdefault('is_staff',True)
        extra_fields.setdefault('is_superuser',True)
        extra_fields.setdefault('is_active',True)
        
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        
        email=self.normalize_email(email)
       
        user = self.model(email=email,username = username,role='A',**extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    