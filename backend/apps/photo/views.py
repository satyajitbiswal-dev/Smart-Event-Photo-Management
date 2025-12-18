from django.shortcuts import render
from rest_framework import generics,parsers
from .models import Photo
from .serializers import PhotoBulkUploadSerializer,PhotoDestroySerializer, PhotoBulkUpdateSerialier
from accounts.permissions import IsEventPhotoGrapher
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView
import json
from .tasks import extract_exif,generate_thumbnail,add_watermark,generate_tag
# Create your views here.
class PhotoUploadView(generics.CreateAPIView):
    serializer_class = PhotoBulkUploadSerializer
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)  
        serializer.is_valid(raise_exception=True) 
        print(serializer.validated_data)
        photos = serializer.save() 
        for photo in photos:
            extract_exif.delay(photo.photo_id)
            generate_thumbnail.delay(photo.photo_id)
            add_watermark.delay(photo.photo_id,photo.event.event_name)
            generate_tag.delay(photo.photo_id)
        return Response({
            "message": "Photos are created successfully",
        })

upload_photo_view = PhotoUploadView.as_view()

class PhotoBulkDeleteView(APIView):
    permission_classes =[IsEventPhotoGrapher]
    def delete(self,request,*args,**kwargs):
        serializer = PhotoDestroySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        photo_ids = serializer.validated_data.get("photo_ids")
        qs = Photo.objects.filter(
            photo_id__in = photo_ids,
            event__event_photographer=request.user
        )
        deleted,_ = qs.delete()
        return Response({
            "message":f"{deleted} Photos are deleted successfully",
        })

delete_photos = PhotoBulkDeleteView.as_view()

class BulkPhotoUpdate(generics.GenericAPIView):
    queryset = Photo.objects.all()
    serializer_class = PhotoBulkUpdateSerialier
    def patch(self,request,*args,**kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        print(serializer.validated_data)
        photo_ids =  serializer.validated_data.get("photo_ids")
        tagged_users = serializer.validated_data.get("tagged_users",None) 
        event = serializer.validated_data.get("event",None) 
        is_private = serializer.validated_data.get("is_private",None)
        photos = Photo.objects.filter(photo_id__in=photo_ids)
        # for photo in photos: #N+1 Query btw
        #     if event is not None : photo.event = event
        #     if is_private is not None: photo.is_private = is_private
        #     photo.save()
        #     if tagged_users is not None: photo.tagged_user.set(tagged_users)
        updated_data={}
        if event is not None: updated_data["event"] = event
        if is_private is not None: updated_data["is_private"] = is_private
        if updated_data:
            photos.update(**updated_data)
        if tagged_users is not None:
            for photo in photos:
                photo.tagged_user.set(tagged_users)
        return Response({
            "message":"Done"
        })

update_view = BulkPhotoUpdate.as_view()
        
