from apps.photo.models import *
from rest_framework import serializers
from apps.photo.serializers import PhotoTaggedUsers

class CommentActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ["body","parent_comment"]

    def validate_parent_comment(self,value):
        '''
        parent comment's photo == recent comment photo(should be)
        parent_comment.photo.photo_id ==  context["photo_id"]
        '''
        print(self.context)
        if value is None:
            return value
        if value.photo.photo_id !=  self.context["photo_id"]:
            raise serializers.ValidationError("Parent photo comment should also be from same photo you are commenting.")

        return value    
    
class CommentSerializer(serializers.ModelSerializer):
    user = PhotoTaggedUsers(read_only=True)
    class Meta:
        model = Comment
        fields = [
            'id',
            'photo',
            'parent_comment',
            'user',
            'body',
            'created',
        ]
    
    