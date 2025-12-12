from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import permissions,generics
from rest_framework.authentication import TokenAuthentication
from .models import Event
from .serializers import EventSerializer

# Create your views here.

#Get Event Details and Update
class EventDetailsUpdateView(generics.RetrieveUpdateAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    lookup_field = 'slug'

event_details_update = EventDetailsUpdateView.as_view()