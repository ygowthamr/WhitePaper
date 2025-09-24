from django.db import models

class Note(models.Model):
    title = models.CharField(max_length=255)  # Added so your form can have a title
    content = models.TextField()
    Uname = models.CharField(max_length=30)
    reminder_at = models.DateTimeField(null=True, blank=True)
    reminder_notified = models.BooleanField(default=False)

    def __str__(self):
        return self.title
