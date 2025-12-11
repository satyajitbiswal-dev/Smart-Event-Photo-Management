from django.core.mail import send_mail
from django.core.cache import cache
from django.conf import settings
import random,string,secrets

def send_otp(email):
    subject = "Your OTP for Login in Smart Event Photo Management"
    email_sender = settings.EMAIL_HOST
    otp = random.randint(100000,999999)
    if cache.get(email) is not None:
        otp = cache.get(email)
    else:
        cache.set(email,otp,60)
    message = f"Your OTP is {otp}"
    send_mail(subject,message,email_sender,[email])


def passwordgenerator():
    allowed_special = "!@#$%&*^|?"
    chars = string.ascii_letters+string.digits+allowed_special
    # length = random.randint(8,16)
    return ''.join(secrets.choice(chars) for _ in range(8))

def verify_otp(email,otp):
    if cache.get(email) == otp:
        cache.delete(email)
        return True
    return False