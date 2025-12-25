from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.utils import timezone
from .models import Notification


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


