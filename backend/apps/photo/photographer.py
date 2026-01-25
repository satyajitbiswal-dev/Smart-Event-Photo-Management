from django.shortcuts import get_object_or_404
from .models import *
from .serializers import *
from rest_framework.response import Response
from rest_framework.views import APIView
from .filters import *
from apps.notification.notification import *
from rest_framework.permissions import AllowAny


from django.db.models import F
from django.core.cache import cache




class PhotoViewCountAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, photo_id, *args, **kwargs):
        photo = get_object_or_404(Photo, id=photo_id)

         
        if request.user.is_authenticated:
            viewer_id = f"user:{request.user.id}"
        else:
            session_key = request.session.session_key
            if not session_key:
                request.session.create()
                session_key = request.session.session_key
            viewer_id = f"session:{session_key}"

        # Cache key (30 min window)
        cache_key = f"photo_viewed:{photo_id}:{viewer_id}"

        
        if cache.add(cache_key, 1, timeout=60 * 30):
            Photo.objects.filter(id=photo_id).update(
                view_count=F("view_count") + 1
            )

            return Response({
                "status": "counted",
                "view_count_incremented": True
            })

        return Response({
            "status": "ignored",
            "view_count_incremented": False
        })


class PhotoGraphicDashBoard(APIView):
    # permission_classes = [is] Event Photographer

    def get(self, request, *args, **kwargs):
        return Response({
            'message':''
        })
    

    # Like Count
    # Comment Count
    # Download Count
    # View Count




from django.db.models import Sum, Count
# Per event
class DashBoardEventView(APIView):
    # permission_classes = [is] Event Photographer

    def get(self, request, *args, **kwargs):
        user = self.request.user
        photographed_events = Event.objects.filter(event_photographer = user)
        if not photographed_events:
            return Response({
                'message':'No Photographed Events'
            })
        
        event_ids = photographed_events.values_list("id", flat=True)
        photo_view_summary = Photo.objects.filter(event_id__in=event_ids).values('event_id').annotate(photo_count = Count('photo_id'), view_count = Sum('view_count') )
        photo_view_map = {}
        for p in photo_view_summary:
            photo_view_map[p['event_id']] = p

        # Like
        like_stats = Like.objects.filter(photo__event_id__in = event_ids).values('photo__event_id').annotate(
            like_count = Count('like_id') ) 
        like_map = {}
        for like in like_stats:
            like_map[like['photo__event_id']] = like['like_count']

        # Comment
        comment_stats = Comment.objects.filter(photo__event_id__in = event_ids).values('photo__event_id').annotate(
            comment_count = Count('id')
        )
        comment_map = {}
        for c in comment_stats:
            comment_map[c['photo__event_id']] = c['comment_count']

        # Download
        download_stats = PhotoDownload.objects.filter(photo__event_id__in = event_ids).values('photo__event_id').annotate( 
            download_count = Count('id')
        )
        download_map = {}
        for d in download_stats:
            download_map[d['photo__event_id'] ] = d['download_count']
        
        # Photo Level Data
        summary = {
            'total_events' : photographed_events.count(),
            'total_photos' : 0,
            'total_likes' : 0,
            'total_views': 0,
            'total_comments': 0,
            'total_downloads': 0
        }

        events_data = []
        for e in photographed_events:
            photostat = photo_view_map.get(e.id) or {}
            photos = photostat.get('photo_count',0)
            views = photostat.get('view_count',0)
            likes = like_map.get(e.id, 0)
            comments = comment_map.get(e.id, 0)
            downloads = download_map.get(e.id, 0)
            events_data.append({
                "event":e,
                'photo_count':photos,
                'view_count':views,
                'like_count':likes,
                'comment_count':comments,
                'download_count':downloads
            })
            summary['total_photos'] += photos
            summary['total_views'] += views
            summary['total_likes'] += likes
            summary['total_comments'] += comments
            summary['total_downloads'] += downloads

    
        response_data = {
            "summary": summary,
            "events": events_data
        }

        serializer = PhotographerDashboardSerializer(response_data)
        return Response(serializer.data)

    