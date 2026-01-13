from django.core.mail import send_mail
from django.core.cache import cache
from django.conf import settings
import random,string,secrets
from .tasks import send_otp_email
from django.utils.crypto import get_random_string

def generate_unique_username(base_username):
        username = base_username
        from .models import User
        while User.objects.filter(username=username).exists():
            username = f"{base_username}_{get_random_string(4).lower()}"
        return username


def generate_and_send_otp(email):
    otp = random.randint(100000, 999999)
    cache.set(email, otp, timeout=60)  # 5 minutes
    send_otp_email.delay(email, otp)



def passwordgenerator():
    allowed_special = "!@#$%&*^|?"
    chars = string.ascii_letters+string.digits+allowed_special
    return ''.join(secrets.choice(chars) for _ in range(8))

def verify_otp(email,otp):
    if cache.get(email) == int(otp):
        cache.delete(email)
        return True
    return False


                
def generate_username_from_email(email: str):
    
    base = email.split("@")[0]              # satyajit, john.doe
    base = base.replace(".", "").lower()    # johndoe
    number = random.randint(1000, 9999)     # 4 digit suffix
    return f"{base}_{number}"