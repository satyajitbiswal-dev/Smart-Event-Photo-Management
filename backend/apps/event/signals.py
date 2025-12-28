from django.dispatch import receiver
from django.db.models.signals import pre_save, post_save, m2m_changed
from .models import Event
from .tasks import *
from apps.notification.notification import *

@receiver(post_save, sender=Event)
def post_save_event(sender,instance,created, *args, **kwargs):
    if created:
        qrcode_generator.delay(instance.id)
    


@receiver(m2m_changed, sender=Event.event_members.through)
def event_member_change(sender,instance,action,pk_set,*args, **kwargs):

    if action == 'post_add':
        event_notification(event=instance,pk_set=pk_set)
        send_event_member_mail.delay(instance,pk_set)
    
    if action == 'post_remove':
        for pk in pk_set:
            user = User.objects.filter(pk=pk).first()
            notification=Notification.objects.filter(user=user,type="event_notif",event=instance).first()
            notification.delete()
    
