from django.urls import path,include
from .views import *
from .userlogin import *
from . import admin

urlpatterns = [
    path('', home_view),
    path("auth/me/", MeAPIView.as_view()),
    path('register/',UserRegisterView.as_view()),
    # path('accounts/channeli/callback/', userlogin.oauth_login_view),
    path('google/callback/', oauth_login_view),
    path('users/', ListMembers.as_view()),
    path('profile/<str:username>/', profile_view),
    path('update/<str:username>/', UserProfileUpdateView.as_view()),
    path('login/send-otp/', login_otp_send),
    path('login/verify-otp/', otp_verify),
    path('logout/',logout_view),
    path('admininterface/add_user/', admin.add_user),
    # path('admininterface/update_user_role/', admin.update_user_role),
    # path('admininterface/get_user_role/', admin.get_user_role),
    path("api/admin/approve", approve_user),
    path("api/admin/reject", reject_user),
]