from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied
from rest_framework import generics,parsers
from .models import Photo, Tag
from .serializers import PhotoBulkUploadSerializer,PhotoDestroySerializer, PhotoBulkUpdateSerialier, PhotoSerializer, PhotoListSerializer, PhotoDownloadSerializer
from accounts.permissions import IsEventPhotoGrapher
from rest_framework.response import Response
from rest_framework.views import APIView
from .tasks import extract_exif,generate_thumbnail,add_watermark,generate_tag
import os
from rest_framework import filters
from django_filters.rest_framework import DjangoFilterBackend
from django.http import HttpResponseBadRequest, FileResponse, HttpResponseNotFound
from .filters import PhotoFilter, search
from apps.notification.views import *

# Create your views here.
class PhotoUploadView(generics.CreateAPIView):
    serializer_class = PhotoBulkUploadSerializer
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)  
        serializer.is_valid(raise_exception=True) 
        photos = serializer.save() 
        #get event and tagged users 
        event = serializer.validated_data['event']
        tagged_users = serializer.validated_data.get("tagged_users",None)
        photo_tagged_users_dict = {}
        for photo in photos:
            extract_exif.delay(photo.photo_id)
            generate_thumbnail.delay(photo.photo_id)
            add_watermark.delay(photo.photo_id,photo.event.event_name)
            generate_tag.delay(photo.photo_id)
            if tagged_users is not None: photo_tagged_users_dict.update({photo:tagged_users})
        
        #send notifications
        photoupload_notification(event=event,photos=photos)
        if tagged_users is not None:
            taguser_notification(photo_tagged_user_dict=photo_tagged_users_dict,event=event)

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

#correct handles now will create get for all attribute later
class BulkPhotoUpdate(generics.GenericAPIView):
    queryset = Photo.objects.all()
    serializer_class = PhotoBulkUpdateSerialier
    def patch(self,request,*args,**kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        photo_ids =  serializer.validated_data.get("photo_ids")
        #get updated values
        tagged_users = serializer.validated_data.get("tagged_users",None) 
        event = serializer.validated_data.get("event",None) 
        is_private = serializer.validated_data.get("is_private",None)
        tags = serializer.validated_data.get("tags",None)
        photos = Photo.objects.filter(photo_id__in=photo_ids)
        #set new data
        updated_data={}
        if event is not None: updated_data["event"] = event
        if is_private is not None: updated_data["is_private"] = is_private
        if updated_data:
            photos.update(**updated_data)
        #set new tags
        updated_tags = []
        photo_tagged_user_dict={}
        if tags is not None:
                for tag in tags:
                    tag_instance = Tag.objects.get_or_create(tag_name=tag)[0]
                    updated_tags.append(tag_instance)
        for photo in photos:
            if tags is not None : photo.tag.set(updated_tags)
            #get new tagged_users for each photo for sending notification
            if tagged_users is not None:
                old_tagged_users = photo.tagged_user.all()
                new_tagged_users=set(tagged_users)-set(old_tagged_users)
                photo_tagged_user_dict.update({photo : list(new_tagged_users)})
                photo.tagged_user.set(tagged_users)

        #send tag user notification
        print("DICT:", photo_tagged_user_dict)
        taguser_notification(photo_tagged_user_dict=photo_tagged_user_dict,event=event)
        return Response({
            "message":"Photos are updated successfully"
        })

update_view = BulkPhotoUpdate.as_view()


#is_private == true :- Only can be seen by Members
#is_private == False :- main Image can be seen by members and watermarked_image can be seen by public
#additional field (like count)
class PhotoRetrieveView(generics.RetrieveAPIView):
    lookup_field = 'photo_id'
    serializer_class = PhotoSerializer
    def get_queryset(self): #queryset mil gaya
        if self.request.user.role == 'P':
            return Photo.objects.filter(is_private=False)
        return Photo.objects.all()

photo_retreive_view = PhotoRetrieveView.as_view()

#List view of photos is_private = true no public access 
class PhotoListView(generics.ListAPIView):
    serializer_class = PhotoListSerializer
    # filter_backends = [filters.SearchFilter]
    # search_fields = ['event__event_name','event__event_photographer__name','tag__tag_name','tagged_user__username']
    filterset_class = PhotoFilter

    def get_queryset(self):
        queryset = Photo.objects.all()
        event_name = self.request.query_params.get("event")
        q = self.request.query_params.get("q")
        if event_name:
            queryset = queryset.filter(event__event_name = event_name)
        if q:
            queryset = search(q,queryset)
        if self.request.user.role == 'P':
            queryset = queryset.filter(is_private=False)
        return queryset

photo_list_view = PhotoListView.as_view()

class DownloadAPIView(APIView):
    def get(self,request,photo_id,*args,**kwargs):
        #public not allowed
        if request.user.role == 'P':
            raise PermissionDenied("Only Members can Download Photos")
        #For members 
        photo=get_object_or_404(Photo,photo_id=photo_id)
        
        image_type = request.query_params.get("image_type","watermarked")
        if image_type == "original":
            image_file =  photo.photo.path
        elif image_type == "watermarked":
            image_file = photo.watermarked_image.path
        else:
            return HttpResponseBadRequest("Please Provide a valid type")
        
        response = FileResponse(open(image_file, "rb"), as_attachment=True)
        response["Content-Disposition"] = f'attachment; filename="{os.path.basename(image_file)}"'
        photo.downloaded_by.add(request.user)
        return response
       
download_view = DownloadAPIView.as_view()

#protect the endpoint /media/photos/ (not to show public users)



#PhotoGraphic Dashboard (Total likes , Total Downloads, uploaded photo in chrononical order)

