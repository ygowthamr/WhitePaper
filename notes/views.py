from django.contrib.auth.decorators import login_required
from django.shortcuts import render , redirect
from notesapp.models import text
from django.http import JsonResponse
import json
from django.views.decorators.csrf import ensure_csrf_cookie



@login_required

@login_required
def newnote(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            note_content = data.get('note')
            username = request.user.username
            
            if not note_content:
                return JsonResponse({'success': False, 'error': 'Note content is required'}, status=400)
            
            # Save the note to the database
            upload = text(Uname=username, content=note_content)
            upload.save()
            
            return JsonResponse({'success': True, 'note_id': upload.id}, status=201)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    
    return JsonResponse({'success': False, 'error': 'Invalid request method'}, status=405)


@login_required
def getnotes(request):
    username = request.user.username
    data = text.objects.filter(Uname=username)
    
    # Prepare the data to be returned as JSON
    notes_data = [{'id': note.id, 'content': note.content} for note in data]
    
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