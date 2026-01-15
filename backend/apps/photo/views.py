from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied
from rest_framework import generics,parsers
from .models import *
from .serializers import *
from accounts.permissions import IsEventPhotoGrapher
from rest_framework.response import Response
from rest_framework.views import APIView
from .tasks import *
import os
from rest_framework import filters
from django_filters.rest_framework import DjangoFilterBackend
from django.http import HttpResponseBadRequest, FileResponse
from .filters import *
from apps.notification.notification import *

# Create your views here.
class PhotoUploadView(generics.GenericAPIView):
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]
    permission_classes = [IsEventPhotoGrapher]

    def post(self, request,*args, **kwargs):
        serializer = PhotoBulkUploadSerializer(data=request.data)  
        serializer.is_valid(raise_exception=True) 
        event = get_object_or_404(Event,id = kwargs["id"])
        photos = serializer.save(event=event) 
        # get event and tagged users 
        tagged_users = serializer.validated_data.get("tagged_users",None)
        photo_tagged_users_dict = {}
        for photo in photos:
            extract_exif.delay(photo.photo_id)
            generate_thumbnail.delay(photo.photo_id)
            add_watermark.delay(photo.photo_id,photo.event.event_name)
            generate_tag.delay(photo.photo_id)
            if tagged_users is not None: photo_tagged_users_dict.update({photo:tagged_users})
        
        #send notifications
        photo_uploader = request.user
        photoupload_notification(event=event,photos=photos,photo_uploader=photo_uploader)
        if tagged_users is not None:
            taguser_notification(photo_tagged_user_dict=photo_tagged_users_dict,event=event)

        return Response({
            "message": "Photos are created successfully",
        })

upload_photo_view = PhotoUploadView.as_view()


class PhotoBulkDeleteView(generics.GenericAPIView):
    permission_classes =[IsEventPhotoGrapher]
    def delete(self,request,*args,**kwargs):
        serializer = PhotoDestroySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        photo_ids = serializer.validated_data.get("photo_ids")
        qs = Photo.objects.filter(photo_id__in = photo_ids,event_id=kwargs["id"])
        qs.delete()
        return Response({
            "message":" Photos are deleted successfully",
        })

delete_photos = PhotoBulkDeleteView.as_view()

#correct handles now will create get for all attribute later
class BulkPhotoUpdate(generics.GenericAPIView):
    queryset = Photo.objects.all()
    serializer_class = PhotoBulkUploadSerializer
    permission_classes = [IsEventPhotoGrapher]
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
        taguser_notification(photo_tagged_user_dict=photo_tagged_user_dict,event=event)
        return Response({
            "message":"Photos are updated successfully"
        })

update_view = BulkPhotoUpdate.as_view()


class PhotoRetrieveView(generics.RetrieveAPIView):
    lookup_field = 'photo_id'
    serializer_class = PhotoSerializer
    def get_queryset(self): #queryset mil gaya
        if self.request.user.role == 'P':
            return Photo.objects.filter(is_private=False)
        return Photo.objects.all()

photo_retreive_view = PhotoRetrieveView.as_view()


class PhotoListView(generics.ListAPIView):
    serializer_class = PhotoListSerializer
    filterset_class = PhotoFilter

    def get_queryset(self):
        qs = Photo.objects.all()
        params = self.request.query_params
        user = self.request.user

        #  Context scoping
        if params.get("event_id"):
            qs = qs.filter(event=params.get("event_id"))

        if params.get("favorites") == "true" and user.is_authenticated:
            qs = qs.filter(is_favourite_of=user)

        if params.get("tagged") == "true" and user.is_authenticated:
            qs = qs.filter(tagged_user=user)

        #  Filters (django-filter)
        qs = PhotoFilter(self.request.GET, queryset=qs).qs

        # Search
        search_query = params.get("search")
        if search_query:
            qs = search(search_query, qs)

        #  Privacy
        if user.is_anonymous or user.role == 'P':
            qs = qs.filter(is_private=False)

        return qs


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


