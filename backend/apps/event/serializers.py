from .models import Event
from rest_framework import serializers
from accounts.models import User

class EventMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('email')
class EventSerializer(serializers.ModelSerializer):
    users = User.objects.all()
    event_coordinator = serializers.SlugRelatedField(slug_field = 'email',queryset = User.objects.all())
    event_photographer = serializers.SlugRelatedField(slug_field = 'email',queryset = User.objects.all())
    event_members = serializers.SlugRelatedField(many=True,slug_field = 'email',queryset = User.objects.all())
    class Meta:
        model = Event
        fields = [
            'event_name',
            'event_coordinator',
            'event_photographer',
            'description',
            'date_time',
            'qr_code',
            'event_members'
        ]

    def validate_event_coordinator(self,value):
        if value.role == 'P':
            raise serializers.ValidationError("Event Coordinator should be an active member of Club")
        return value
    def validate_event_photographer(self,value):
        if value.role == 'P':
            raise serializers.ValidationError("Event Photographer should be an active member of Club")
        return value
    
    #Crazy VVVImportant
    def update(self, instance, validated_data):
    # event_members list nikalo (agar PATCH me aayi ho)
        event_members = validated_data.pop('event_members', None)
        # baaki normal fields update
        instance = super().update(instance, validated_data)
        if event_members is not None:
            # sirf NON-PUBLIC users allow karo
            allowed_members = []
            for user in event_members:
                if user.role != 'P':   # P = Public (NOT allowed)
                    allowed_members.append(user)

            # replace strategy
            instance.event_members.set(allowed_members)

        return instance


        
