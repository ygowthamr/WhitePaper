from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from notesapp.models import text

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
    print(context)
    return render(request, 'notesapp/index.html', context)