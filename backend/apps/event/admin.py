from django.contrib import admin
from rest_framework import permissions,generics,authentication
from .models import Event
from .serializers import EventSerializer
from accounts.permissions import IsAdminUser
from rest_framework.authentication import TokenAuthentication
from rest_framework.views  import APIView

# Register your models here.


#create a new event and assign event co-ordinator
class EventCreateView(generics.CreateAPIView):
    queryset = Event
    serializer_class = EventSerializer
    permission_classes =[IsAdminUser]
    authentication_classes = [TokenAuthentication]
    
event_create = EventCreateView.as_view()


# delete an event