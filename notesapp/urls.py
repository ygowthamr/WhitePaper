from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name="mynotepad"),
    path('autosave/', views.autosave_note, name='autosave'),

   
]
