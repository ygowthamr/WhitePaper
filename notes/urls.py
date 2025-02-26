from django.urls import path
from . import views

urlpatterns = [
    path('newnote/', views.newnote, name="newnote"),
    path('getnotes/', views.getnotes, name="getnotes"),
    path('deletenote/<int:note_id>/', views.deletenote, name="deletenote"),
    path('updatenote/<int:note_id>/', views.updatenote, name='updatenote'),
    path('share/<int:note_id>/', views.share_note, name='share_note'),
    path('printnote/<int:note_id>/', views.printnote, name='print_note'),
    path('shared/update/<int:note_id>/', views.update_shared_note, name='update_shared_note'),
    path('share/permissions/<int:note_id>/', views.manage_share_permissions, name='manage_share_permissions'),
]