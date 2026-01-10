from .models import Event
from rest_framework import serializers
from accounts.models import User
from django.db import transaction

class EventMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('email')
class EventSerializer(serializers.ModelSerializer):
    event_coordinator = serializers.SlugRelatedField(slug_field = 'email',queryset = User.objects.all())
    event_photographer = serializers.SlugRelatedField(slug_field = 'email',queryset = User.objects.all())
    event_members = serializers.SlugRelatedField(many=True,slug_field = 'email',queryset = User.objects.all(),required=False)
    class Meta:
        model = Event
        fields = '__all__'
    
    def validate_event_coordinator(self,value):
        if value.role == 'P':
            raise serializers.ValidationError("Event Coordinator should be an active member of Club")
        return value
    def validate_event_photographer(self,value):
        if value.role == 'P':
            raise serializers.ValidationError("Event Photographer should be an active member of Club")
        return value
    
    def update(self, instance, validated_data):
        event_members = validated_data.pop('event_members', None)
        instance = super().update(instance, validated_data)
        
        current_members = set(instance.event_members.all())
        old_members = current_members.copy()
        if event_members is not None:
            for user in event_members:
                if user.role != 'P':   
                    current_members.add(user)
            
        # Also check if new event coordinator or event photographer is assigned add them also to event_members category
        if instance.event_photographer:
           current_members.add(instance.event_photographer)
        if instance.event_coordinator:
            current_members.add(instance.event_coordinator)
        #get diff to update
        new_members = current_members - old_members
        if new_members:
            instance.event_members.add(*new_members)

        return instance

    def create(self, validated_data):
        instance = Event.objects.create(**validated_data)
        new_event_members = []
        if validated_data.get("event_photographer"):
            new_event_members.append(validated_data.get("event_photographer"))
        if validated_data.get("event_coordinator"):
            new_event_members.append(validated_data.get("event_coordinator"))
        admin = self.context.get("request").user
        new_event_members.append(admin)
        instance.event_members.add(*new_event_members)
        return instance

        
class EventActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            'event_coordinator',
            'event_photographer',
            'event_members'
        ]