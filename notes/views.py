from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404
from django.utils import timezone  # Add this import
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
            heading = data.get('heading', '').strip()  
            note_content = data.get('note', '').strip()
            tags = data.get('tags', [])  
            username = request.user.username

            if not note_content:
                return JsonResponse({'success': False, 'error': 'Note content is required'}, status=400)

        
            full_content = f"{heading}|||{note_content}" if heading else note_content
         
        
            note = text(Uname=username, content=full_content)
            note.save()

          
            for tag_name in tags:
                tag_name = tag_name.strip()
                if tag_name:
                    Tag.objects.create(name=tag_name, note=note)

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

    notes_data = []
    for note in notes:
        if "|||" in note.content:
            heading, content = note.content.split("|||", 1)  # Split at first occurrence
        else:
            heading, content = "Untitled", note.content 

        notes_data.append({
            'id': note.id,
            'heading': heading.strip(), 
            'content': content.strip(),
            'tags': list(note.tags.values_list('name', flat=True))
        })

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




@login_required
def printnote(request, note_id):
    """
    Endpoint to fetch a specific note for printing
    """
    if request.method == "GET":
        try:
            # Get the note and verify ownership
            note = text.objects.get(id=note_id, Uname=request.user.username)
            
            # Prepare note data for printing
            note_data = {
                'id': note.id,
                'content': note.content,
                'tags': list(note.tags.values_list('name', flat=True)),
                'created_at': note.created_at.isoformat() if hasattr(note, 'created_at') else timezone.now().isoformat(),
                'author': note.Uname
            }
            
            return JsonResponse({
                'success': True,
                'note': note_data
            })
            
        except text.DoesNotExist:
            return JsonResponse({
                'success': False, 
                'error': 'Note not found'
            }, status=404)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)
            
    return JsonResponse({
        'success': False,
        'error': 'Invalid request method'
    }, status=405)
def share_note(request, note_id):
    """View for displaying a shared note"""
    note = get_object_or_404(text, id=note_id)
    
    # Create context with minimal data needed for shared view
    context = {
        'shared_note': {
            'content': note.content,
            'tags': list(note.tags.values_list('name', flat=True)),
            'author': note.Uname
        }
    }
    
    return render(request, 'notesapp/shared_note.html', context)