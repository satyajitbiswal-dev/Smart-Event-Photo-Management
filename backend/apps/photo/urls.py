from django.urls import path
from . import views

urlpatterns = [
    path('<uuid:photo_id>/' , views.photo_retreive_view),
    path('upload_photo/' , views.upload_photo_view),
    path('delete_photo/' , views.delete_photos),
    path('update_photo/' , views.update_view),
]
