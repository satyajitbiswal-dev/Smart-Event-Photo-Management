from celery import shared_task
import qrcode
from .models import Event
from io import BytesIO
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.cache import caches
from django.core.mail import send_mail
from accounts.models import User

@shared_task
def qrcode_generator(event_id):
    event = Event.objects.filter(id=event_id).first()
    url = f"{settings.FRONTEND_URL}{event.get_absolute_url()}/photos/"
    qr = qrcode.QRCode()
    qr.add_data(url)
    img = qr.make_image()

    qr_code_name = f"{event.slug}.jpg"
    new_img_io = BytesIO()
    img.save(new_img_io,format='JPEG')
    event.qr_code.save(
        name=qr_code_name,
        content=ContentFile(new_img_io.getvalue()),
        save=True
    )
    
@shared_task
def send_event_member_mail(event_id,pk_set):
    event = Event.objects.filter(id=event_id).first()
    subject=f"You are added to new Event {event.event_name}"
    from_email = settings.EMAIL_HOST_USER
    message=f"You are added to new Event {event.event_name}-{event.event_date}. Check out Smart Event Photo Management for new uploaded photos."

    if event.event_coordinator_id in pk_set:
        event_coordinator_message = f"You are added to event {event.event_name}-{event.event_date.year}.You are assigned as a coordinator for this event."
        pk_set.remove( event.event_coordinator_id )
        send_mail(subject=subject,message=event_coordinator_message,from_email=from_email,recipient_list = [event.event_coordinator.email])

    if event.event_photographer_id in pk_set:
        event_photographer_message = f"You are added to event {event.event_name}-{event.event_date.year}.You are assigned as a photographer for this event."
        pk_set.remove(event.event_photographer_id)
        send_mail(subject=subject,message=event_photographer_message,from_email=from_email,recipient_list = [event.event_photographer.email])

    recipient_list_instance = User.objects.filter(pk__in=pk_set)
    recipient_list = list(recipient_list_instance.values_list("email",flat=True))
    send_mail(subject=subject,message=message,from_email=from_email,recipient_list = recipient_list)

