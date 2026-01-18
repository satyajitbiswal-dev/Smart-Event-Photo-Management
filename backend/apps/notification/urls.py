from django.urls import path
from .views import *

urlpatterns = [
    path('list/',NotificationList.as_view()),
    path("<int:id>/seen/",MarkNotificationSeenView.as_view(),name="notification-seen" ),
    path("mark-all-seen/",MarkAllNotificationsSeenView.as_view(),name="notification-mark-all-seen"),
    path( "<int:id>/delete/", DeleteNotificationView.as_view(), name="notification-delete",),
    path("clear-all/",ClearAllNotificationsView.as_view(),name="notification-clear-all" ),
]