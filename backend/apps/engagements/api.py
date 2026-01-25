from apps.photo.models import Photo,Like,Favourite
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import transaction,IntegrityError
from rest_framework import generics
from apps.photo.serializers import PhotoListSerializer
from django.shortcuts import get_object_or_404
from .serializers import *
from rest_framework.permissions import IsAuthenticated
from rest_framework.status import HTTP_201_CREATED
# Create your views here.

#add like 
class LikeAdd(APIView):
    def post(self,request,photo_id,*args,**kwargs):
        photo = get_object_or_404(Photo,photo_id=photo_id)
        user = self.request.user 
        try:
            with transaction.atomic():
                Like.objects.create(user=user,photo=photo)
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
    def delete(self,request,photo_id,*args,**kwargs):
        photo = get_object_or_404(Photo,photo_id=photo_id) 
        user = self.request.user
        Like.objects.filter(user=user,photo=photo).delete()
        return Response({
            "message":"Like Removed"
        })

remove_like = RemoveLike.as_view()


#all below are only allowed to members
#add photo to my favourites 
class AddToFavourite(APIView):
    def post(self,request,photo_id,*args,**kwargs):
        photo = get_object_or_404(Photo,photo_id=photo_id)  
        user = self.request.user 
        try:
            with transaction.atomic():
                Favourite.objects.create(user=user,photo=photo)
        except IntegrityError:
            return Response(
                {"message": "Already added to Favourites"},
                status=400
            )
        return Response({
            "message":"You added the photo to your favourites"
        })

add_favourite = AddToFavourite.as_view()

# Remove Photo from my favourites 
class RemoveFavourite(APIView):
    def delete(self,request,photo_id,*args,**kwargs):
        photo = get_object_or_404(Photo,photo_id=photo_id)  
        user = self.request.user
        Favourite.objects.filter(user=user,photo=photo).delete()
        return Response({
                "message":"Removed from your Favourite List"
            })

remove_favourite = RemoveFavourite.as_view()

# Favourite Photo List give only thumbnail and id 
class ListFavouritePhotos(generics.ListAPIView):
    def get_queryset(self):
        return Photo.objects.filter(is_favourite_of=self.request.user)
    serializer_class = PhotoListSerializer
    
list_favourites = ListFavouritePhotos.as_view()

# Tagged In Photo List
class ListTaggedInPhotos(generics.ListAPIView):
    def get_queryset(self):
        return Photo.objects.filter(tagged_user=self.request.user)
    serializer_class = PhotoListSerializer
    
list_tagged_in = ListTaggedInPhotos.as_view()

# Add Comments for a photo
class CommentAdd(APIView):
    permission_classes = [IsAuthenticated]
    def post(self,request,photo_id,*args,**kwargs):
        user = request.user
        serializer = CommentActionSerializer(data=request.data,context={"photo_id":photo_id,"request":request})
        serializer.is_valid(raise_exception=True)
        photo = get_object_or_404(Photo,photo_id=photo_id)
        comment = serializer.save(user=user,photo=photo)

        return Response(CommentSerializer(comment).data,status=HTTP_201_CREATED)

add_comment = CommentAdd.as_view()
# Delete Comments for a photo
class CommentRemove(APIView):
    permission_classes = [IsAuthenticated]
    def delete(self,request,photo_id,*args,**kwargs):
        user = request.user
        photo = get_object_or_404(Photo,photo_id=photo_id)
        comment_id = request.data.get("comment_id")
        comment = get_object_or_404(Comment, id=comment_id, user=user, photo=photo)
        
        comment.delete()
    
        return Response({
            "id":comment_id,
            "photo_id":photo_id,
            "message": "Comment deleted successfully."
        })
        

remove_comment = CommentRemove.as_view()


class CommentFetchbyPhoto(generics.ListAPIView):
    serializer_class = CommentSerializer
    # permission_classes = [IsAuthenticated]
    def get_queryset(self):
        photo_id = self.kwargs.get('photo_id')
        qs = Comment.objects.filter(photo__photo_id=photo_id)
        return qs