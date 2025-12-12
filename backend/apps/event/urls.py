from django.urls import path
from . import admin,eventcoordinator,views

urlpatterns = [
    path('create/' , admin.event_create),
    path('<str:event_name>/about/' , views.event_details_update),
    # path('add_user/' , eventcoordinator.add_user_to_events),
]
