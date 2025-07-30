from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from notesapp.models import text
from django.views.decorators.csrf import csrf_exempt
import json

def index(request):
    if request.user.is_authenticated:
        username = request.user.username
        data = text.objects.filter(Uname=username)
        context = {
            'Uname': username,
            'data': data,
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

from django.views.decorators.csrf import csrf_protect

@csrf_exempt
@login_required
def autosave_note(request):
    if request.method == 'POST':
        
        print("🔁 POST received from:", request.user.username)
        try:
            data = json.loads(request.body)
            print(" Data:", data)
            note_id = data.get('id')
            new_content = data.get('content')

            note = text.objects.get(id=note_id, Uname=request.user.username)
            note.content = new_content
            note.save()

            return JsonResponse({'status': 'success'})
        except text.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Note not found'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
    return JsonResponse({'status': 'error', 'message': 'Invalid request'})
