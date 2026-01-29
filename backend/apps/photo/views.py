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
from django_filters.rest_framework import DjangoFilterBackend
from django.http import HttpResponseBadRequest, FileResponse
from .filters import *
from apps.notification.notification import *
from rest_framework.pagination import PageNumberPagination
from collections import defaultdict
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny

from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.exceptions import NotFound

class PhotoPagination(PageNumberPagination):
    page_size = 24

    def paginate_queryset(self, queryset, request, view=None):
        try:
            return super().paginate_queryset(queryset, request, view)
        except NotFound:
            # page out of range → return empty list
            self.page = None
            return []

    def get_paginated_response(self, data):
        if self.page is None:
            # out-of-range page
            return Response({
                "count": 0,
                "next": None,
                "previous": None,
                "results": [],
            })

        # NORMAL DRF PAGINATION
        return Response({
            "count": self.page.paginator.count,
            "next": self.get_next_link(),
            "previous": self.get_previous_link(),
            "results": data,
        })

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

        for photo in photos:
            extract_exif.delay(photo.photo_id)
            generate_thumbnail.delay(photo.photo_id)
            add_watermark.delay(photo.photo_id,photo.event.event_name)
            generate_tag.delay(photo.photo_id)
           
        #send notifications
        photo_uploader = request.user
        photoupload_notification(event=event,photos=photos,photo_uploader=photo_uploader)
        if tagged_users is not None:
            photo_tagged_user = defaultdict(int)
            for tagged_user in tagged_users:
                photo_tagged_user[tagged_user] = len(photos)
            taguser_notification(photo_tagged_user=photo_tagged_user,event=event)

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
    serializer_class = PhotoBulkUpdateSerialier
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
        if tags is not None:
                for tag in tags:
                    tag_instance = Tag.objects.get_or_create(tag_name=tag)[0]
                    updated_tags.append(tag_instance)

        photo_tagged_user = defaultdict(int)
        if tagged_users:
            new_tagged_users = set(tagged_users)
            existing_tagged = (
                    Photo.tagged_user.through.objects.filter(photo_id__in=photos.values_list("photo_id", flat=True))
                    .values_list("photo_id", "user_id")
            )
            photo_to_users = defaultdict(set)
            for photo_id, user_id in existing_tagged:
                photo_to_users[photo_id].add(user_id)

        
        for photo in photos:
            if tags is not None : photo.tag.add(*updated_tags)
            #get new tagged_users for each photo for sending notification
            if tagged_users:
                already = photo_to_users.get(photo.photo_id, set())
                newly_added = new_tagged_users - already
                for user in newly_added:
                    photo_tagged_user[user] += 1
        if tagged_users:
            Photo.tagged_user.through.objects.bulk_create([
                Photo.tagged_user.through(photo_id=photo.photo_id, user_id=user.id)
                for photo in photos 
                for user in new_tagged_users
                if user not in photo_to_users.get(photo.photo_id, set())
            ],
        ignore_conflicts=True
    )
        #send tag user notification
        updated_event = event or photos[0].event
        taguser_notification(photo_tagged_user=photo_tagged_user,event=updated_event) #photo_tagged_user = {user: photo_count}
        
        return Response({
            "message":"Photos are updated successfully"
        })

update_view = BulkPhotoUpdate.as_view()

# single photo update view 
class PhotoSingleUpdateView(generics.RetrieveUpdateAPIView):
    queryset = Photo.objects.all()
    lookup_field='photo_id'
    serializer_class=PhotoUpdateSerializer
    permission_classes=[IsEventPhotoGrapher]


class PhotoRetrieveView(generics.RetrieveAPIView):
    lookup_field = 'photo_id'
    serializer_class = PhotoSerializer
    def get_queryset(self): #queryset mil gaya
        user = self.request.user
        if not user.is_authenticated or  getattr(user,'role',None) == 'P':
            return Photo.objects.filter(is_private=False)
        return Photo.objects.all()

photo_retreive_view = PhotoRetrieveView.as_view()


class PhotoListView(generics.ListAPIView):
    serializer_class = PhotoListSerializer
    filterset_class = PhotoFilter
    pagination_class = PhotoPagination

    def get_queryset(self):
        qs = Photo.objects.all()
        params = self.request.query_params
        user = self.request.user
        #  Context scoping
        if event_id := params.get("event_id"):
            qs = qs.filter(event_id=event_id)

        if params.get("favorites") == "true" and user.is_authenticated:
            qs = qs.filter(is_favourite_of=user)

        if params.get("tagged") == "true" and user.is_authenticated:
            qs = qs.filter(tagged_user=user)

        #  Filters (django-filter)
        qs = PhotoFilter(self.request.GET, queryset=qs).qs

        # Search
        if search_query :=params.get("search"):
            qs = search(search_query, qs)

        #  Privacy
        if not user.is_authenticated or  getattr(user,'role',None) == 'P':
            qs = qs.filter(is_private=False)

        return qs


photo_list_view = PhotoListView.as_view()



class DownloadAPIView(APIView):
    def get(self,request,photo_id,*args,**kwargs):
        #public not allowed
        if not request.user.is_authenticated or request.user.role == "P":
            raise PermissionDenied("Only Members can Download Photos")
        
        #For members 
        photo=get_object_or_404(Photo,photo_id=photo_id)
        user = request.user
        
        image_type = request.query_params.get("image_type","watermarked")

        if image_type == "original":
            image_file =  photo.photo.path
            limit_time = timezone.now() - timedelta(days=30)

            count = PhotoDownload.objects.filter(
                user=request.user,
                download_type="original",
                downloaded_at__gte=limit_time).count()
            if count >= 50:
                return Response(
                    {"message": "Monthly original download limit reached", "limit": 50},
                    status=403
                )
        elif image_type == "watermarked":
            image_file = photo.watermarked_image.path
        else:
            return HttpResponseBadRequest("Please Provide a valid type")
        
        PhotoDownload.objects.create(
            photo_id=photo_id,
            user=request.user,
            download_type=image_type
        )

        response = FileResponse(open(image_file, "rb"), as_attachment=True)
        response["Content-Disposition"] = f'attachment; filename="{os.path.basename(image_file)}"'

        return response
    
       
download_view = DownloadAPIView.as_view()

class RemainingDownloadAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, *args, **kwargs):
        LIMIT = 50
        user = request.user

        limit_time = timezone.now() - timedelta(days=30)

        qs = PhotoDownload.objects.filter(
            user=user,
            download_type="original",
            downloaded_at__gte=limit_time
        )

        count = qs.count()
        remaining = max(0, LIMIT - count)

        earliest = qs.order_by("downloaded_at").first()
        reset_time = (
            earliest.downloaded_at + timedelta(days=30)
            if earliest else None
        )

        return Response({
            "limit": LIMIT,
            "used": count,
            "remaining": remaining,
            "reset_time": reset_time,
            "blocked": count >= LIMIT
        })





