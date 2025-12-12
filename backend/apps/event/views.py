from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import permissions,generics
from rest_framework.authentication import TokenAuthentication
from .models import Event
from .serializers import EventSerializer

# Create your views here.

#Get Event Details
class EventDetails(generics.RetrieveAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    lookup_field = 'event_name' #slug daaldo bhai

event_details = EventDetails.as_view()

class EventDetailsUpdateView(generics.RetrieveUpdateAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    lookup_field = 'event_name'

event_details_update = EventDetailsUpdateView.as_view()