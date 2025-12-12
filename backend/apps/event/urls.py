from django.urls import path
from . import admin,eventcoordinator,views

urlpatterns = [
    path('create/' , admin.event_create),
    path('<slug:slug>/about/' , views.event_details_update),
]
