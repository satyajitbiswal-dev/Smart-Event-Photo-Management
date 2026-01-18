from apps.photo.models import *
from django.dispatch import receiver
from django.db.models.signals import post_save, post_delete
from apps.notification.notification import *
# Create your Signals here.

# (){'signal': <django.db.models.signals.ModelSignal object at 0x000002C9011D2F10>, 'sender': <class 'apps.photo.models.Like'>, 'action': 'pre_add', 'instance': <Photo: Photo object (fd2e11c1-79ca-4120-b7a4-3951361ab156)>, 'reverse': False, 'model': <class 'accounts.models.User'>, 'pk_set': {13}, 'using': 'default'}
# (){'signal': <django.db.models.signals.ModelSignal object at 0x000002C9011D2F10>, 'sender': <class 'apps.photo.models.Like'>, 'action': 'post_add', 'instance': <Photo: Photo object (fd2e11c1-79ca-4120-b7a4-3951361ab156)>, 'reverse': False, 'model': <class 'accounts.models.User'>, 'pk_set': {13}, 'using': 'default'}
# {'signal': <django.db.models.signals.ModelSignal object at 0x0000028BE5F63820>, 'sender': <class 'apps.photo.models.Like'>, 'instance': <Like: Like object (682e1307-f43a-422b-8d44-40e2e9fae242)>, 'created': True, 'update_fields': None, 'raw': False, 'using': 'default'}

@receiver(post_save,sender=Like)
def liked_user_add(sender, instance, created, *args,**kwargs):
    if not created:
        return 
    # print(args,kwargs)
    photo = instance.photo
    like_broadcast(photo=photo)
    liked_users_db(photo=photo)

@receiver(post_delete,sender=Like)
def liked_user_delete(sender, instance, *args,**kwargs):
    # print(args,kwargs)
    photo = instance.photo
    like_broadcast(photo=photo)
    # liked_users_db(photo=photo)


@receiver(post_save,sender=Comment)
def commented_users_add(sender, instance, created, *args, **kwargs):
    if not created:
        return
    parent_comment = instance.parent_comment
    comment_broadcast(comment=instance,parent_comment=parent_comment)
    send_comment_notification(comment=instance, parent_comment=parent_comment)

@receiver(post_delete,sender=Comment)
def commented_users_delete(sender, instance, *args, **kwargs):
    parent_comment = instance.parent_comment
    comment_broadcast(comment=instance,parent_comment=parent_comment)
    
