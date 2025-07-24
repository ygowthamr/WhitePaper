from django.core.exceptions import ValidationError

def validate_not_blank(value):
    if not value.strip():
        raise ValidationError('Note cannot be blank.')

class Note(models.Model):
    text = models.TextField(validators=[validate_not_blank])
