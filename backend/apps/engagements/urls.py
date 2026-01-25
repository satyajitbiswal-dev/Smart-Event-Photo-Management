from django.urls import path
from .api import *
urlpatterns = [
   path('<uuid:photo_id>/add_like/',add_like),
   path('<uuid:photo_id>/remove_like/',remove_like),
   path('<uuid:photo_id>/add_favourite/',add_favourite),
   path('<uuid:photo_id>/remove_favourite/',remove_favourite),
   path('<uuid:photo_id>/add_comment/',add_comment),
   path('<uuid:photo_id>/remove_comment/',remove_comment),
   path('favourites/',list_favourites),
   path('tagged/',list_tagged_in),
   path('<uuid:photo_id>/comments/',CommentFetchbyPhoto.as_view()),
]
