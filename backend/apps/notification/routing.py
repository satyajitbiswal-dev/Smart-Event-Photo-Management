from django.urls import path
from .consumers import *

websocket_urlpatterns = [
    path('ws/notifications/',Notification.as_asgi())
]