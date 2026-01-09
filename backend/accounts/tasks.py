from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.core.cache import cache

@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_kwargs={'max_retries': 3, 'countdown': 5},
)
def send_otp_email(self, email, otp):
    send_mail(
        subject="Your OTP for Smart Event Photo Management",
        message=f"Your OTP is {otp}",
        from_email=settings.EMAIL_HOST_USER,
        recipient_list=[email],
        fail_silently=False,
    )

@shared_task
def send_confirmation_message_admin(email,approval_token_id):
    from .models import User, Token
    admin = User.objects.filter(role = 'A', is_active=True).first()
    approval_token = Token.objects.get(id=approval_token_id)
    user = approval_token.user
    context = {
        "approve_url" : f"http://localhost:8000/api/admin/approve?token={approval_token.token}",
        "reject_url" : f"http://localhost:8000/api/admin/approve?token={approval_token.token}",
        "user_email" : user.email,
        "user_name" : user.name, 
    }
    subject = 'New User wants to register in Smart Event Photo Management Platform'
    html_message = render_to_string('accounts/mail_template.html', context=context)
    plain_message = strip_tags(html_message)
    from_email = settings.EMAIL_HOST_USER
    send_mail(subject, plain_message, from_email, [admin], html_message=html_message)

@shared_task
def user_join_notification(email,username):
    subject = 'Welcome to Smart Event Photo Management Platform'
    message = f'Dear {username},\n\nYour registration has been approved. Welcome aboard!\n\nBest Regards,\nSmart Event Team'
    from_email = settings.EMAIL_HOST_USER
    send_mail(subject, message, from_email, [email])