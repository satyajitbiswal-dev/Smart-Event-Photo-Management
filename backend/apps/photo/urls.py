from django.urls import path
from . import views

# /photos ---> base url

urlpatterns = [
    path('',views.photo_list_view),
    path('upload_photo/<uuid:id>/' , views.upload_photo_view),
    path('delete_photo/<uuid:id>/' , views.delete_photos),
    path('update_photo/' , views.update_view),
    path('<uuid:photo_id>/' , views.photo_retreive_view),
    path('<uuid:photo_id>/download/' , views.download_view),
]
