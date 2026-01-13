from django.urls import path,include
from .views import *
from .userlogin import *
from .userapi import *
from apps.event.views import UserEventActivity

urlpatterns = [
    path('', home_view),
    path("auth/me/", MeAPIView.as_view()),
    path('register/',UserRegisterView.as_view()),
    # path('accounts/channeli/callback/', userlogin.oauth_login_view),
    path('google/callback/', oauth_login_view),
    path('users/', ListMembers.as_view()),
    path('profile/<str:username>/', profile_view),
    path('update/<str:username>/', UserProfileUpdateView.as_view()),
    path('update/<str:username>/profile_pic/', ProfilePicUpdateView.as_view()),
    path('login/send-otp/', login_otp_send),
    path('login/verify-otp/', otp_verify),
    path('logout/',logout_view),
    path('admininterface/add_user/', add_user),
    path("admininterface/remove-user/<str:username>/", RemoveUser.as_view()),
    path('admininterface/update_user_role/<str:username>/', update_user_role),
    path("api/admin/approve", approve_user),
    path("api/admin/reject", reject_user),
    path('event_activity/' ,UserEventActivity.as_view()),
    path('<str:username>/profile_pic/', ProfilePicView.as_view()),
]