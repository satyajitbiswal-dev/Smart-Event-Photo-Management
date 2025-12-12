from django.urls import path,include
from .import views
from . import userlogin
from . import admin

urlpatterns = [
    path('', views.home_view),
    path('users/', views.ListMembers.as_view()),
    path('profile/<str:username>/', views.profile_view),
    path('update/<str:username>/', views.UserProfileUpdateView.as_view()),
    path('public/send-otp/', userlogin.otp_send),
    path('public/verify-otp/', userlogin.otp_verify),
    path('login/', userlogin.member_login),
    path('admininterface/add_user/', admin.add_user),
    path('admininterface/update_user_role/', admin.update_user_role),
    path('admininterface/get_user_role/', admin.get_user_role),
]