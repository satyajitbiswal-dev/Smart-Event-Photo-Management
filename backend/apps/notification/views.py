from rest_framework import generics
from .serializers import *
from .models import Notification
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from rest_framework.response import Response

class PhotoPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 10


#Fetch all notifications
class NotificationList(generics.ListAPIView):
    serializer_class = NotificationSerializer
    def get_queryset(self):
        user = self.request.user
        qs = Notification.objects.filter(user = user)
        return qs




# mark_seen notification

class MarkNotificationSeenView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, id):
        notification = get_object_or_404(Notification,id=id,user=request.user)

        if not notification.is_seen:
            notification.is_seen = True
            notification.save(update_fields=["is_seen"])

        return Response({
            "success": True,
            "notification_id": notification.id
        })
    

class MarkAllNotificationsSeenView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        updated = Notification.objects.filter(
            user=request.user,
            is_seen=False
        ).update(is_seen=True)

        return Response({
            "success": True,
            "updated_count": updated
        })



# delete a notification

class DeleteNotificationView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, id):
        notification = get_object_or_404(
            Notification,
            id=id,
            user=request.user
        )
        notification.delete()

        return Response({
            "success": True,
            "deleted_id": id
        })


# clear all notification
class ClearAllNotificationsView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        deleted_count, _ = Notification.objects.filter(
            user=request.user
        ).delete()

        return Response({
            "success": True,
            "deleted_count": deleted_count
        })
