from django.urls import path
from . import views
from django.http import JsonResponse


urlpatterns = [
    path('signup/',views.signup),
    path('login/', views.login),
    path('logout/', views.logout, name='logout'),
    path('password_reset/', views.password_reset, name='password_reset'),
    path('password_reset/reset-password/', views.reset_password, name='reset-password'),
]
