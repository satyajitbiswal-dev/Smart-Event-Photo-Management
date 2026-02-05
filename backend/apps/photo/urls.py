from django.urls import path
from . import views,photographer

# /photos ---> base url

urlpatterns = [
    path('',views.photo_list_view),
    path('upload_photo/<uuid:id>/' , views.upload_photo_view),
    path('delete_photo/<uuid:id>/' , views.delete_photos),
    path('update_photo/' , views.update_view),
    path('update_photo/<uuid:photo_id>/' , views.PhotoSingleUpdateView.as_view()),
    path('<uuid:photo_id>/' , views.photo_retreive_view),
    path('<uuid:photo_id>/download/' , views.download_view),
    path('photographer/dashboard/' , photographer.DashBoardEventView.as_view()),
    path('<uuid:photo_id>/view/' , photographer.PhotoViewCountAPIView.as_view()),
    path( "events/<uuid:id>/download-zip/",views.DownloadEventPhotosZip.as_view()),
]
