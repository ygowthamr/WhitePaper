from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from notesapp.models import Note
import json
from django.utils.timezone import now, localtime

def index(request):
    if request.user.is_authenticated:
        username = request.user.username
        notes = Note.objects.filter(Uname=username)
        processed_notes = []
        reminders = []
        for note in notes:
            if "|||" in note.content:
                heading, content = note.content.split("|||", 1)
            else:
                heading, content = "Untitled", note.content
            processed_notes.append({
                'id': note.id,
                'heading': heading.strip(),
                'content': content.strip(),
                'tags': list(note.tags.values_list('name', flat=True)) if hasattr(note, 'tags') else []
            })

        # ✅ Add reminder data if it's in the future
            if note.reminder_at and note.reminder_at > now():
                reminders.append({
                    'id': note.id,
                    'heading': heading.strip(),
                    'reminder_at': localtime(note.reminder_at).isoformat()
                })

        context = {
            'Uname': username,
            'data': processed_notes,
            'upcomingReminders': json.dumps(reminders)
        }
    else:
        context = {
            'Uname': None,
            'data': None,
        }
    if(context['Uname'] is not None):
        return render(request, 'notesapp/main.html', context)
    else:
        return render(request, 'notesapp/index.html', context)

def terms_conditions(request):
    return render(request, 'notesapp/terms_conditions.html')

def privacy_policy(request):
    return render(request, 'notesapp/privacy_policy.html')

def faq(request):
    return render(request, 'notesapp/faq.html')