from django.urls import path
from . import views

urlpatterns = [
    path('newnote/',views.newnote,name="newnote")
]
