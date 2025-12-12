from .models import Event
from rest_framework import serializers

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            'event_name',
            'event_coordinator',
            'description'
        ]