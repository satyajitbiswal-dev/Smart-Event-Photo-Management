from django.urls import path
from . import api
urlpatterns = [
   path('add_like/',api.add_like),
   path('remove_like/',api.remove_like)
]
