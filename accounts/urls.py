from django.urls import path, include
from . import views
from django.http import JsonResponse

urlpatterns = [
    path('signup/', views.signup, name='signup'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('password_reset/', views.password_reset, name='password_reset'),
    path('password_reset/reset-password/', views.reset_password, name='reset-password'),

    # ✅ Correct path for django-allauth
    path('accounts/', include('allauth.urls')),
]
