from django.contrib.auth.models import User
from django.db import models
from django.db.models.deletion import CASCADE
from django.contrib.auth.models import User
from django.db.models.fields import EmailField

class text(models.Model):
    content=models.TextField()
    Uname = models.CharField(max_length=30)
