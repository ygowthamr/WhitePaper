from django.db import models
from notesapp.models import text

class Tag(models.Model):
    name = models.CharField(max_length=50)
    note = models.ForeignKey(text, on_delete=models.CASCADE, related_name='tags')
    
    def __str__(self):
        return self.name