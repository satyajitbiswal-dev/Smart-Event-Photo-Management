from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.utils import timezone
from .models import Notification
from accounts.models import User

def notify_user(notification: Notification):
    channel_layer = get_channel_layer()

    async_to_sync(channel_layer.group_send)(
        f"notify_user_{notification.user_id}",
        {
            "type": "send_notification",
            "value": {
                "id": notification.id,
                "type": notification.type,
                "text_message": notification.text_message,
                "is_seen": notification.is_seen,
                "send_time": notification.send_time.isoformat(),

                "photo_id":str (notification.photo_id),
                "comment_id": str(notification.comment_id),
                "event_id": str(notification.event_id),
            },
        },
    )

#Add Notification creation or updation to all

def photoupload_notification(event,photos,photo_uploader):
    channel_layer = get_channel_layer()

    event_members = event.event_members.exclude(email = photo_uploader.email)
    if len(photos) == 1:
        s = "photo is"
    else:
        s = "photos are"

    for member in event_members:
        notif = Notification.objects.create(
            user = member,
            type="PHOTO_UPLOADED",
            text_message=f"{len(photos)} photos uploaded to event {event.event_name}.",
            event=event,
            is_seen=False,
        )
        notify_user(notification=notif)

    #for photographer 
    notif = Notification.objects.create(
        user=photo_uploader,
        type="PHOTO_UPLOADED_SELF",
        text_message=f"You uploaded {len(photos)} photos to event {event.event_name}.",
        event=event,
        is_seen=False,
    )
    notify_user(notif)

# message : You are tagged in a photo and sending photo id
def taguser_notification(photo_tagged_user, event):
    if event is None:
        return
    
    for user,count in photo_tagged_user.items():
        if count > 0:
            notif = Notification.objects.create(
                user = user,
                type="PHOTO_UPLOADED_TAG",
                text_message=f"You are tagged in {count} photo{'s' if count != 1 else ''} of event {event.event_name}",  
                event=event,
                is_seen=False,
            )
            notify_user(notification=notif)

# count hi bhej de laadle

def like_broadcast(photo):
    channel_layer = get_channel_layer()
    like_count = photo.liked_users.count()
    async_to_sync(channel_layer.group_send)(
        "like_broadcast",{
            "type":"like_update",
            "value":{
                     "type": 'LIKE_COUNT_UPDATE',
                     "photo_id" : str(photo.photo_id),
                     "like_count" : like_count,
            }
        }
    )

def liked_users_db(photo):
    photographer = photo.event.event_photographer
    like_count = photo.liked_users.count()
    if like_count == 0:
        # Notification.objects.filter(user=photographer,type="photographer_like_notif").delete()
        return
        #delete the notification
    users = list(photo.liked_users.all()[0:2])
    if like_count == 1:
        message = f"{users[0].username} liked your uploaded photo."
    elif like_count == 2:
        message = f"{users[0].username} and {users[1].username} liked your uploaded photo."
    else:
        message = f"{users[0].username}, {users[1].username} and {like_count-2} others liked your uploaded photo."
    
    notif, created = Notification.objects.update_or_create(
            user=photographer, type="PHOTO_LIKED", photo = photo,
            defaults={"text_message" : message, "is_seen" : False}
        )
    
    notify_user(notif)



def comment_broadcast(comment,parent_comment):
    if parent_comment is not None: parent_comment_id = str(parent_comment.id)
    else:  parent_comment_id = None
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "comment_broadcast",{
            "type": "comment_update",
                 "value":{
                    "type" : "Comment Broadcast",
                    "photo_id" : str(comment.photo.photo_id),
                    "parent_comment" : parent_comment_id ,
                    "commentator": comment.user.username,
                    "body":comment.body
            }
        }
    )


#There is bug in it

def send_comment_notification(comment,parent_comment):
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
        return 

    notif  = Notification.objects.create(user=parent_commentator, 
                                         type="COMMENT_CREATED", 
                                         photo = comment.photo,text_message=message, 
                                         comment=comment)
    
    notify_user(notification=notif)


def event_notification(event,pk_set):
    message = f"You are added to event {event.event_name}-{event.event_date.year}"

    for pk in pk_set:
        user = User.objects.filter(pk=pk).first()
        if event.event_coordinator_id == pk:
            message = f"You are added to event {event.event_name}-{event.event_date.year}.You are assigned as a coordinator for this event."
        if event.event_photographer_id == pk:
            message = f"You are added to event {event.event_name}-{event.event_date.year}.You are assigned as a photographer for this event."
        notif = Notification.objects.create(user = user, type="EVENT_NOTIF",text_message=message ,event=event)

        notify_user(notif)
    
    #speacial notification to photographer and event-coordinator 
