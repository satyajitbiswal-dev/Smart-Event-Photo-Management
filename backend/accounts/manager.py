from django.contrib.auth.models import UserManager
from django.utils.translation import gettext_lazy as _
from .utils import generate_unique_username


class CustomUserManager(UserManager):
    def create_user(self,email, username, password,name=None,**extra_fields):
        if not email:
            raise ValueError(_('You must provide an email in order to Login'))
        email = self.normalize_email(email)

        extra_fields.setdefault('is_staff',False)
        extra_fields.setdefault('is_superuser',False)
        extra_fields.setdefault('is_active',True)

        user = self.model(email=email, username=username, name=name, status='P', **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    #OAuth Login->It may be member or may be Public
    def create_oauth_user(self,data,role='P',password=None,**extra_fields):
        email = data.get("email") or None
        if not email:
            raise ValueError(_('You must provide an email in order to Login'))
        email = self.normalize_email(email)
        name = data.get("name") 
        enrollment = data.get("enrollment") or None
        department = data.get("department") or None
        base_username = (data.get("name") or email.split("@")[0]).replace(" ", "").lower()
        username = generate_unique_username(base_username)


        extra_fields.setdefault('is_staff',False)
        extra_fields.setdefault('is_superuser',False)
        extra_fields.setdefault('is_active',True)
        user = self.model(email=email,name = name,
                          username=username,enrollment=enrollment ,
                          department = department,role = role,
                          **extra_fields)
        
        if role == ('M' or 'A') and password is not None:
            user.set_password(password)
        else:
            user.set_unusable_password() 
        user.save(using=self._db)
        return user
    
    #SuperUser SignUp
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


    '''
    Admin decides role(Admin or Member) and admin decides pending , active , rejected

    '''