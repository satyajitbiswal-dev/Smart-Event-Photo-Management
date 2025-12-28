from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.utils import timezone
from .models import Notification
from accounts.models import User

#Add Notification creation or updation to all
def photoupload_notification(event,photos):
    channel_layer = get_channel_layer()

    event_members = event.event_members.exclude(email = event.event_photographer.email)
    if len(photos) == 1:
        str = "photo is"
    else:
        str = "photos are"

    for member in event_members:
        async_to_sync(channel_layer.group_send)(
            f"notify_user_{member.pk}",{
                "type":"send_notification",
                "value":{
                    "message":f"{len(photos)} {str} uploaded to Event {event.event_name}.",
                    "event_id":event.id,
                }
            }
        )

    #for photographer 
    async_to_sync(channel_layer.group_send)(
        f"notify_user_{event.event_photographer.pk}",
        {
            "type":"send_notification",
            "value":{
                "message":f"You uploaded {len(photos)} photos to Event {event.event_name}.",
                "event_id":event.id,
            }
        }
    )

# message : You are tagged in a photo and sending photo id
def taguser_notification(photo_tagged_user_dict, event):
    channel_layer = get_channel_layer()
    if event is None:
        event = list(photo_tagged_user_dict.keys())[0].event
    for photo,tagged_users in photo_tagged_user_dict.items():
        for tagged_user in tagged_users:
            print(photo.photo_id,tagged_user.pk)
            async_to_sync(channel_layer.group_send)(
                f"notify_user_{tagged_user.pk}",{
                "type": "send_notification",
                 "value":{
                     "message" : f"You are tagged in a photo of event {event.event_name}.",
                     "photo_id" : str(photo.photo_id),
                 }
            })

def like_broadcast(photo):
    channel_layer = get_channel_layer()
    like_count = photo.liked_users.count()
    async_to_sync(channel_layer.group_send)(
        "like_broadcast",{
            "type":"send_notification",
            "value":{
                     "photo_id" : str(photo.photo_id),
                     "like_count" : like_count,
            }
        }
    )

def liked_users_db(photo):
    photographer = photo.event.event_photographer
    like_count = photo.liked_users.count()
    if like_count == 0:
        Notification.objects.filter(user=photographer,type="photographer_like_notif").delete()
        return
        #delete the notification
    some_liked_users = list(photo.liked_users.all()[0:2])
    if like_count == 1:
        message = f"{some_liked_users[0].username} liked your uploaded photo."
    elif like_count == 2:
        message = f"{some_liked_users[0].username} and {some_liked_users[1].username} liked your uploaded photo."
    else:
        message = f"{some_liked_users[0].username}, {some_liked_users[1].username} and {like_count-2} others liked your uploaded photo."
    
    obj, created = Notification.objects.update_or_create(
            user=photographer, type="photographer_like_notif", photo = photo,
            defaults={"text_message" : message, "is_seen" : False}
            # create_defaults={"user":photographer, "type":"photographer_like_notif","text_message" : message},
        )
    
    return message

def like_notif_to_photographer(photo,message):
    channel_layer = get_channel_layer()
    photographer = photo.event.event_photographer
    
    async_to_sync(channel_layer.group_send)(
        f"notify_user_{photographer.pk}",{
                "type": "send_notification",
                 "value":{
                     "message" : message ,
                     "photo_id" : str(photo.photo_id),
                 }
        }
    )

def comment_broadcast(comment,parent_comment):
    if parent_comment is not None: parent_comment_id = str(parent_comment.id)
    else:  parent_comment_id = None
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "comment_broadcast",{
            "type": "send_notification",
                 "value":{
                    "photo_id" : str(comment.photo.photo_id),
                    "parent_comment" : parent_comment_id ,
                    "commentator": comment.user.username,
                    "body":comment.body
            }
        }
    )

#There is bug in it
def build_comment_notification(comment,parent_comment):
    '''
        When comment is added to direct photo notify to the photograher
        When comment is the reply of another comment notify to the commentator
    '''
        #delete it from notification db(but how a same comment may have a database)
    if parent_comment is None:
        parent_commentator = comment.photo.event.event_photographer
        message = f"{comment.user.username} commented on your photo."
    else:
        parent_commentator = parent_comment.user
        message = f"{comment.user.username} replied to your comment."
     
    if parent_commentator == comment.user:
        return None,None
    
    return parent_commentator,message


def send_comment_notification(comment,parent_commentator,message):
    Notification.objects.create(user=parent_commentator, type="comment_notif", photo = comment.photo,text_message=message, comment=comment)
    channel_layer = get_channel_layer()

    async_to_sync(channel_layer.group_send)(
        f"notify_user_{parent_commentator.pk}",{
            "type": "send_notification",
                 "value":{
                    "photo_id" : str(comment.photo.photo_id),
                    "message":message,
            }
        }
    )


def event_notification(event,pk_set,message):
    channel_layer = get_channel_layer()
    message = f"You are added to event {event.event_name}-{event.event_date.year}"

    for pk in pk_set:
        user = User.objects.filter(pk=pk).first()
        if event.event_coordinator_id is pk:
            message = f"You are added to event {event.event_name}-{event.event_date.year}.You are assigned as a coordinator for this event."
        if event.event_photographer_id is pk:
            message = f"You are added to event {event.event_name}-{event.event_date.year}.You are assigned as a photographer for this event."
        Notification.objects.create(user = user, type="event_notif",text_message=message ,event=event)

        async_to_sync(channel_layer.group_send)(
            f"notify_user_{pk}",{
                "type": "send_notification",
                    "value":{
                        "event_id" : str(event.id),
                        "message": message
                }
            }
        )
    
    #speacial notification to photographer and event-coordinator 
