from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from notesapp.models import text

def index(request):
    if request.user.is_authenticated:
        username = request.user.username
        notes = text.objects.filter(Uname=username)

        # Process notes to separate heading and content
        processed_notes = []
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

        context = {
            'Uname': username,
            'data': processed_notes,
        }
        return render(request, 'notesapp/main.html', context)
    else:
        context = {
            'Uname': None,
            'data': None,
        }
        return render(request, 'notesapp/index.html', context)

def license_view(request):
    return render(request, 'license.html')  