from django.shortcuts import render , redirect
from notesapp.models import text

# Create your views here.

def newnote(request):
	if request.method == "POST":
		note = request.POST['note']
		username = request.user.username
		upload = text(Uname=username,content=note)
		upload.save()
		data = text.objects.filter(Uname=username)
		context = {
			'Uname':username,
			'data':data,
		}
		return render(request, 'notesapp/main.html',context)
	else:
		username = request.user.username
		data = text.objects.filter(Uname=username)
		context = {
			'Uname': username,
			'data': data,
		}
		return render(request,'notesapp/main.html',context)
