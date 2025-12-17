from django.urls import path
from . import views

urlpatterns = [
    path('upload_photo/' , views.upload_photo_view),
    path('delete_photo/' , views.delete_photos),
    path('update_photo/' , views.update_view),
]
