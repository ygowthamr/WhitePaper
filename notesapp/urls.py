from django.urls import path
from . import views

urlpatterns = [
    path('', views.note_list, name='home'),  # Define root URL
    path('register/', views.register, name='register'),
    path('login/', views.user_login, name='login'),
    path('notes/', views.note_list, name='note_list'),
]
