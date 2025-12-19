from django.shortcuts import render
from apps.photo.models import Photo,Like
from accounts.models import User
from rest_framework.views import APIView
from .serializers import PhotoLikeSerializer
from rest_framework.response import Response
from django.db import transaction,IntegrityError
# Create your views here.

#add like 
class LikeAdd(APIView):
    def post(self,request,*args,**kwargs):
        serializer = PhotoLikeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        photo = serializer.validated_data.get("photo_id")  
        user = self.request.user 
        try:
            with transaction.atomic():
                photo.liked_users.add(user)
        except IntegrityError:
            return Response(
                {"message": "Already liked"},
                status=400
            )
        # print(user,photo)
        return Response({
            "message":"You Liked the photo"
        })

add_like = LikeAdd.as_view()
# remove like

class RemoveLike(APIView):
    def delete(self,request,*args,**kwargs):
        serializer = PhotoLikeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        photo = serializer.validated_data.get("photo_id")  
        user = self.request.user
        if photo.liked_users.filter(email=user.email).exists() :
            photo.liked_users.remove(user)
        return Response({
            "message":"Like Removed"
        })

remove_like = RemoveLike.as_view()



# add photo to my favourites 


# Remove Photo from my favourites 


# Favourite Photo List


# Tagged In Photo List


#Download a photo means Download to the particular folder of your system have to make an download table for this to track total download of a photo


#Share a Photo absolute URL means want to share url of that photo 

