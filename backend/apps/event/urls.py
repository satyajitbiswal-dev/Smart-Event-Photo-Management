from django.urls import path
from .views import *

#event/ baseurl
urlpatterns = [
    path('create/' ,event_create_view),
    path('<uuid:id>/update/' ,event_details_update),
    path('<uuid:id>/' ,event_details_view, name = "event-details"),
    path('<uuid:id>/delete/' ,event_delete_view),
    path('' ,event_list_view),
]
