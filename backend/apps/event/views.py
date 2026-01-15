from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import permissions,generics,mixins
from rest_framework.authentication import TokenAuthentication
from .models import Event
from .serializers import *
from django.shortcuts import get_object_or_404
from accounts.permissions import IsEventCoordinator,IsAdminUser
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated


# Create your views here.

#Get Event Details and Update
class EventCreateView(generics.CreateAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes =[IsAdminUser]

event_create_view = EventCreateView.as_view()

# delete an event
class EventDeleteView(generics.DestroyAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes =[IsAdminUser]
    lookup_field = 'id'

event_delete_view = EventDeleteView.as_view()
class EventDetailsView(generics.RetrieveAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    lookup_field = 'id'

event_details_view = EventDetailsView.as_view()

class EventListView(generics.ListAPIView,):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
event_list_view = EventListView.as_view()

class EventDetailsUpdateView(generics.RetrieveUpdateAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    lookup_field = 'id'
    permission_classes = [IsEventCoordinator]
    def get_object(self):
        obj = get_object_or_404(self.get_queryset(), id=self.kwargs["id"])
        self.check_object_permissions(self.request, obj)
        return obj

event_details_update = EventDetailsUpdateView.as_view()

class UserEventActivity(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, *args, **kwargs):
        user = self.request.user
        print(user)
        coordinated_events = Event.objects.filter(event_coordinator = user)
        photographed_events = Event.objects.filter(event_photographer = user)
        participated_events = user.participated_events.all()

        # serializer = EventSerializer()
        # serializer.is_valid(raise_exception=True)
        return Response({
            "coordinated_events":EventSerializer(coordinated_events,many=True).data,
            "photographed_events":EventSerializer(photographed_events,many=True).data,
            "participated_events":EventSerializer(participated_events,many=True).data
        })
