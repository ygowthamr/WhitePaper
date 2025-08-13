from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404, redirect
from django.utils import timezone
from notesapp.models import Note
from django.http import JsonResponse
import json
from django.views.decorators.csrf import ensure_csrf_cookie
from .models import Tag, SharedNotePermission
from .models import Note
from .forms import NoteForm

@ensure_csrf_cookie
@login_required
def newnote(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            heading = data.get('heading', '').strip()
            note_content = data.get('note', '').strip()
            tags = data.get('tags', [])
            reminder_at = data.get('reminder_at')  # ISO datetime string or None
            username = request.user.username

            if not note_content:
                return JsonResponse({'success': False, 'error': 'Note content is required'}, status=400)

            full_content = f"{heading}|||{note_content}" if heading else note_content
            note = Note(Uname=username, content=full_content)

            # Parse reminder if provided
            if reminder_at:
                try:
                    note.reminder_at = timezone.make_aware(timezone.datetime.fromisoformat(reminder_at))
                except Exception:
                    return JsonResponse({'success': False, 'error': 'Invalid reminder datetime format'}, status=400)

            note.save()

            for tag_name in tags:
                tag_name = tag_name.strip()
                if tag_name:
                    Tag.objects.create(name=tag_name, note=note)

            return JsonResponse({
                'success': True,
                'note': {
                    'id': note.id,
                    'heading': heading if heading else "Untitled",
                    'reminder_at': note.reminder_at.isoformat() if note.reminder_at else None
                }
            }, status=201)

        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

    return JsonResponse({'success': False, 'error': 'Invalid request method'}, status=405)


@login_required
def getnotes(request):
    username = request.user.username
    tag_filter = request.GET.get('tag')

    notes = Note.objects.filter(Uname=username)
    if tag_filter:
        notes = notes.filter(tags__name=tag_filter)

    notes_data = []
    upcoming_reminders = []
    now = timezone.now()
    for note in notes:
        if "|||" in note.content:
            heading, content = note.content.split("|||", 1)
        else:
            heading, content = "Untitled", note.content

        notes_data.append({
            'id': note.id,
            'heading': heading.strip(),
            'content': content.strip(),
            'tags': list(note.tags.values_list('name', flat=True)),
            'reminder_at': note.reminder_at.isoformat() if note.reminder_at else None
        })
        # Add to upcoming reminders list if within next 10 minutes
        if note.reminder_at and now <= note.reminder_at <= now + timezone.timedelta(minutes=10):
            upcoming_reminders.append({
                'id': note.id,
                'heading': heading.strip(),
                'reminder_at': note.reminder_at.isoformat()
            })

    return JsonResponse({
        'notes': notes_data,
        'upcoming_reminders': upcoming_reminders
    })

@ensure_csrf_cookie
@login_required
def deletenote(request, note_id):
    if request.method == "DELETE":
        try:
            note = Note.objects.get(id=note_id, Uname=request.user.username)
            note.delete()
            return JsonResponse({'success': True})
        except Note.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Note not found'}, status=404)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    return JsonResponse({'success': False, 'error': 'Invalid request method'}, status=405)


@login_required
def printnote(request, note_id):
    if request.method == "GET":
        try:
            note = Note.objects.get(id=note_id, Uname=request.user.username)

            note_data = {
                'id': note.id,
                'content': note.content,
                'tags': list(note.tags.values_list('name', flat=True)),
                'created_at': note.created_at.isoformat() if hasattr(note, 'created_at') else timezone.now().isoformat(),
                'reminder_at': note.reminder_at.isoformat() if note.reminder_at else None,
                'author': note.Uname
            }

            return JsonResponse({'success': True, 'note': note_data})

        except Note.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Note not found'}, status=404)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

    return JsonResponse({'success': False, 'error': 'Invalid request method'}, status=405)


@login_required
def updatenote(request, note_id):
    if request.method == "PUT":
        try:
            note = Note.objects.get(id=note_id, Uname=request.user.username)
            data = json.loads(request.body)

            heading = data.get('heading', '').strip()
            note_content = data.get('note', '').strip()
            note.content = f"{heading}|||{note_content}" if heading else note_content

            # Update reminder
            reminder_at = data.get('reminder_at')
            if reminder_at:
                try:
                    note.reminder_at = timezone.make_aware(timezone.datetime.fromisoformat(reminder_at))
                except Exception:
                    return JsonResponse({'success': False, 'error': 'Invalid reminder datetime format'}, status=400)
            else:
                note.reminder_at = None

            # Update tags
            note.tags.all().delete()
            for tag_name in data.get('tags', []):
                tag_name = tag_name.strip()
                if tag_name:
                    Tag.objects.create(name=tag_name, note=note)

            note.save()
            return JsonResponse({
                'success': True,
                'note': {
                    'id': note.id,
                    'heading': heading if heading else "Untitled",
                    'reminder_at': note.reminder_at.isoformat() if note.reminder_at else None
                }
            })
        except Note.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Note not found'}, status=404)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

    return JsonResponse({'success': False, 'error': 'Invalid request method'}, status=405)


def share_note(request, note_id):
    """View for displaying and possibly editing a shared note"""
    note = get_object_or_404(Note, id=note_id)
    
    is_owner = request.user.is_authenticated and request.user.username == note.Uname
    
    if not is_owner:
        permission = None
        if request.user.is_authenticated:
            try:
                permission = SharedNotePermission.objects.get(
                    note=note,
                    user=request.user
                )
            except SharedNotePermission.DoesNotExist:
                pass
        
        share_token = request.GET.get('token')
        if not permission and share_token:
            try:
                permission = SharedNotePermission.objects.get(
                    note=note,
                    share_token=share_token
                )
            except SharedNotePermission.DoesNotExist:
                return render(request, 'notesapp/access_denied.html')
        
        if not permission:
            return render(request, 'notesapp/access_denied.html')
            
        can_edit = permission.permission == 'edit'
    else:
        can_edit = True
    
    if "|||" in note.content:
        heading, content = note.content.split("|||", 1)
    else:
        heading, content = "Untitled", note.content
    
    context = {
        'shared_note': {
            'id': note.id,
            'heading': heading.strip(),
            'content': content.strip(),
            'tags': list(note.tags.values_list('name', flat=True)),
            'author': note.Uname,
            'can_edit': can_edit
        }
    }
    
    return render(request, 'notesapp/shared_note.html', context)


@ensure_csrf_cookie
@login_required
def manage_share_permissions(request, note_id):
    note = get_object_or_404(Note, id=note_id, Uname=request.user.username)
    
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get('email')
            permission_type = data.get('permission', 'view')
            
            import uuid
            share_token = str(uuid.uuid4())
            
            from django.contrib.auth.models import User
            user = None
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                pass
                
            if user:
                permission, created = SharedNotePermission.objects.update_or_create(
                    note=note,
                    user=user,
                    defaults={
                        'permission': permission_type,
                        'share_token': share_token
                    }
                )
            else:
                permission, created = SharedNotePermission.objects.update_or_create(
                    note=note,
                    shared_with=email,
                    defaults={
                        'permission': permission_type,
                        'share_token': share_token
                    }
                )
                
            share_url = f"/notes/share/{note.id}/?token={share_token}"
                
            return JsonResponse({
                'success': True, 
                'share_url': share_url,
                'permission_id': permission.id
            })
            
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
            
    elif request.method == "GET":
        permissions = SharedNotePermission.objects.filter(note=note)
        
        permission_data = []
        for p in permissions:
            user_email = p.shared_with if p.shared_with else p.user.email if p.user else "Unknown"
            permission_data.append({
                'id': p.id,
                'email': user_email,
                'permission': p.permission,
                'share_url': f"/notes/share/{note.id}/?token={p.share_token}"
            })
            
        return JsonResponse({'success': True, 'permissions': permission_data})
        
    elif request.method == "DELETE":
        try:
            permission_id = request.GET.get('permission_id')
            permission = SharedNotePermission.objects.get(id=permission_id, note=note)
            permission.delete()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    
    return JsonResponse({'success': False, 'error': 'Invalid request method'}, status=405)


@ensure_csrf_cookie
def update_shared_note(request, note_id):
    note = get_object_or_404(Note, id=note_id)
    
    is_owner = request.user.is_authenticated and request.user.username == note.Uname
    
    if not is_owner:
        permission = None
        if request.user.is_authenticated:
            try:
                permission = SharedNotePermission.objects.get(
                    note=note,
                    user=request.user,
                    permission='edit'
                )
            except SharedNotePermission.DoesNotExist:
                pass
                
        share_token = request.GET.get('token')
        if not permission and share_token:
            try:
                permission = SharedNotePermission.objects.get(
                    note=note,
                    share_token=share_token,
                    permission='edit'
                )
            except SharedNotePermission.DoesNotExist:
                return JsonResponse({'success': False, 'error': 'You do not have permission to edit this note'}, status=403)
                
        if not permission:
            return JsonResponse({'success': False, 'error': 'You do not have permission to edit this note'}, status=403)
    
    if request.method == "PUT":
        try:
            data = json.loads(request.body)
            
            heading = data.get('heading', '').strip()
            note_content = data.get('note', '').strip()
            note.content = f"{heading}|||{note_content}" if heading else note_content
            
            if 'tags' in data:
                note.tags.all().delete()
                for tag_name in data.get('tags', []):
                    tag_name = tag_name.strip()
                    if tag_name:
                        Tag.objects.create(name=tag_name, note=note)
            
            note.save()
            
            return JsonResponse({'success': True})
            
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    
    return JsonResponse({'success': False, 'error': 'Invalid request method'}, status=405)
