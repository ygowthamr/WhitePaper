from django.contrib.auth.decorators import login_required
from django.shortcuts import render , redirect
from notesapp.models import text
from django.http import JsonResponse
import json
from django.views.decorators.csrf import ensure_csrf_cookie
from .models import Tag



@login_required

@login_required
def newnote(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            note_content = data.get('note')
            tags = data.get('tags', [])  # Get tags array from request
            username = request.user.username
            
            if not note_content:
                return JsonResponse({'success': False, 'error': 'Note content is required'}, status=400)
            
            # Save the note
            note = text(Uname=username, content=note_content)
            note.save()
            
            # Save tags
            for tag_name in tags:
                Tag.objects.create(name=tag_name.strip(), note=note)
            
            return JsonResponse({'success': True, 'note_id': note.id}, status=201)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    
    return JsonResponse({'success': False, 'error': 'Invalid request method'}, status=405)



@login_required
def getnotes(request):
    username = request.user.username
    tag_filter = request.GET.get('tag')
    
    notes = text.objects.filter(Uname=username)
    if tag_filter:
        notes = notes.filter(tags__name=tag_filter)
    
    notes_data = [{
        'id': note.id, 
        'content': note.content,
        'tags': list(note.tags.values_list('name', flat=True))
    } for note in notes]
    
    return JsonResponse({'notes': notes_data})


@ensure_csrf_cookie
@login_required
def deletenote(request, note_id):
    if request.method == "DELETE":
        try:
            note = text.objects.get(id=note_id, Uname=request.user.username)
            note.delete()
            return JsonResponse({'success': True})
        except text.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Note not found'}, status=404)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    return JsonResponse({'success': False, 'error': 'Invalid request method'}, status=405)