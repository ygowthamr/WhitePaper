from django.shortcuts import render , redirect
from notesapp.models import text

# Create your views here.

def newnote(request):
	if request.method == "POST":
		heading = request.POST.get('heading', '')
		content = request.POST.get('content', '') 
 
		# note = request.POST['note']
		upload = text(heading=heading,content=content, username = request.user.username)
		upload.save()
		data = text.objects.filter(Uname=username)
		context = {
			'Uname':username,
			'data':data,
		}
		return render(request, 'notesapp/main.html',context)
	else:
		username = request.user.username
		data = text.objects.filter(username=username)
		context = {
			'Uname': username,
			'data': data,
		}
		return render(request,'notesapp/main.html',context)
