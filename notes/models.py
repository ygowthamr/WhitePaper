from django.db import models
from notesapp.models import text
from django.db import models
from django.contrib.auth.models import User

class SharedNotePermission(models.Model):
    PERMISSION_CHOICES = [
        ('view', 'View Only'),
        ('edit', 'Edit'),
    ]
    
    note = models.ForeignKey('notesapp.text', on_delete=models.CASCADE, related_name='shared_permissions')
    
    shared_with = models.EmailField(blank=True, null=True)  # For non-registered users
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)  # For registered users
    permission = models.CharField(max_length=10, choices=PERMISSION_CHOICES, default='view')
    share_token = models.CharField(max_length=64, unique=True)  # Unique token for accessing the shared note
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = [['note', 'shared_with'], ['note', 'user']]
        
class Tag(models.Model):
    name = models.CharField(max_length=50)
    note = models.ForeignKey(text, on_delete=models.CASCADE, related_name='tags')
    
    def __str__(self):
        return self.name