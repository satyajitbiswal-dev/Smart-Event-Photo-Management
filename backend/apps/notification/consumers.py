from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import async_to_sync
import json

class Notification(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope["user"]
        if user.is_anonymous:
            await self.close()
            return
        
        self.subscribe_groups = ["like_broadcast","comment_broadcast"]
        if getattr(user,"role",None) != 'P':
            self.subscribe_groups.append(f"notify_user_{user.pk}")

        
        for group_name in self.subscribe_groups:
           await self.channel_layer.group_add(
                group_name,self.channel_name
            )
           
        
        await self.accept()
    
    
    async def disconnect(self,code):
        for group in getattr(self, "subscribe_groups", []):
            await self.channel_layer.group_discard(
                group,
                self.channel_name
            )
    
    async def send_notification(self,event):
        # Send message to WebSocket
       await self.send(text_data=json.dumps(event))
    
    async def like_update(self,event):
        # Send message to WebSocket
       await self.send(text_data=json.dumps(event))
    
    async def comment_update(self,event):
        # Send message to WebSocket
       await self.send(text_data=json.dumps(event))


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
        