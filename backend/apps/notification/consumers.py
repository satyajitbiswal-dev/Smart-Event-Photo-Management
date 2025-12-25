from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from django.http import HttpResponse
from apps.event.models import Event
import json

class Notification(WebsocketConsumer):

    def connect(self):
        user = self.scope["user"]
        if not user.is_authenticated:
            self.close()
            return
        if getattr(user,"role",None) == 'P':
            self.close()
            return

        self.group_name = f"notify_user_{user.pk}"
        
        async_to_sync(self.channel_layer.group_add)(
            self.group_name,self.channel_name
        )
            # self.joined_groups.append(group_name)
        
        self.accept()
    
    
    def receive(self, text_data = None, bytes_data = None):
        return super().receive(text_data, bytes_data)
    
    
    def disconnect(self,code):
        self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )
        
        # self.joined_groups = []
    
    def send_notification(self,event):
        # Send message to WebSocket
       data = event.get("value")
       self.send(text_data=json.dumps({"payload": data}))


# self.groups = [f"notify_user_{user.pk}"]

        #try to get if the user trying to access event notification

        # event_id = self.scope['url_route']['kwargs'].get('event_id')
        # if event_id is not None:
        #     event = Event.objects.filter(id=event_id).first()
        #     if event is None:
        #         self.close()
        #         return
            
        #     if not (event.event_members.filter(email=user.email).exists()):
        #         self.close()
        #         return
        #     if event.event_photographer != user:
        #       self.groups.append(f"notify_event_{event_id}")
        # self.joined_groups = []

        # for group_name in self.groups:text_data_json = json.loads(text_data)
        