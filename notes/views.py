from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404, redirect
from django.utils import timezone
from notesapp.models import text
from django.http import JsonResponse
import json
from django.views.decorators.csrf import ensure_csrf_cookie
from .models import Tag, SharedNotePermission

@ensure_csrf_cookie
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

@login_required
def updatenote(request, note_id):
    if request.method == "PUT":
        try:
            note = text.objects.get(id=note_id, Uname=request.user.username)
            data = json.loads(request.body)
            
            # Update content
            heading = data.get('heading', '').strip()
            note_content = data.get('note', '').strip()
            note.content = f"{heading}|||{note_content}" if heading else note_content
            
            # Update tags
            note.tags.all().delete()
            for tag_name in data.get('tags', []):
                tag_name = tag_name.strip()
                if tag_name:
                    Tag.objects.create(name=tag_name, note=note)
            
            note.save()
            return JsonResponse({'success': True})
            
        except text.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Note not found'}, status=404)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    
    return JsonResponse({'success': False, 'error': 'Invalid request method'}, status=405)

def share_note(request, note_id):
    """View for displaying and possibly editing a shared note"""
    note = get_object_or_404(text, id=note_id)
    
    # Check if the current user is the owner
    is_owner = request.user.is_authenticated and request.user.username == note.Uname
    
    # If not the owner, check if they have permission to view/edit
    if not is_owner:
        # Get share permissions for this note for the current user
        permission = None
        if request.user.is_authenticated:
            try:
                permission = SharedNotePermission.objects.get(
                    note=note,
                    user=request.user
                )
            except SharedNotePermission.DoesNotExist:
                pass
        
        # Check for token-based access (for non-registered users)
        share_token = request.GET.get('token')
        if not permission and share_token:
            try:
                permission = SharedNotePermission.objects.get(
                    note=note,
                    share_token=share_token
                )
            except SharedNotePermission.DoesNotExist:
                return render(request, 'notesapp/access_denied.html')
        
        # If no permission found, deny access
        if not permission:
            return render(request, 'notesapp/access_denied.html')
            
        can_edit = permission.permission == 'edit'
    else:
        can_edit = True
    
    # Parse the content to separate heading from note content
    if "|||" in note.content:
        heading, content = note.content.split("|||", 1)
    else:
        heading, content = "Untitled", note.content
    
    # Create context with data needed for shared view
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
    """Endpoint to manage sharing permissions for a note"""
    note = get_object_or_404(text, id=note_id, Uname=request.user.username)
    
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get('email')
            permission_type = data.get('permission', 'view')  # Default to view-only
            
            # Generate a unique token for this share
            import uuid
            share_token = str(uuid.uuid4())
            
            # Check if the user already exists
            from django.contrib.auth.models import User
            user = None
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                pass
                
            # Create or update permission
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
                
            # Generate share URL
            share_url = f"/notes/share/{note.id}/?token={share_token}"
                
            return JsonResponse({
                'success': True, 
                'share_url': share_url,
                'permission_id': permission.id
            })
            
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
            
    elif request.method == "GET":
        # Return list of all current share permissions
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
    """Endpoint for collaborators to update a shared note"""
    note = get_object_or_404(text, id=note_id)
    
    # Check if user has edit permission
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
                
        # Check for token-based access with edit permission
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
    
    # Process the update
    if request.method == "PUT":
        try:
            data = json.loads(request.body)
            
            # Update content
            heading = data.get('heading', '').strip()
            note_content = data.get('note', '').strip()
            note.content = f"{heading}|||{note_content}" if heading else note_content
            
            # Optionally update tags
            if 'tags' in data:
                note.tags.all().delete()
                for tag_name in data.get('tags', []):
                    tag_name = tag_name.strip()
                    if tag_name:
                        Tag.objects.create(name=tag_name, note=note)
            
            note.save()
            
            # Record edit history (optional enhancement)
            # You could add an EditHistory model to track who made changes and when
            
            return JsonResponse({'success': True})
            
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    
    return JsonResponse({'success': False, 'error': 'Invalid request method'}, status=405)