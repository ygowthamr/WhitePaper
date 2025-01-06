from django.shortcuts import render, redirect
from notesapp.models import text
from django.contrib.auth.models import User, auth
from django.contrib import messages
from django.contrib.auth import logout as auth_logout
from django.contrib.auth.decorators import login_required


# Create your views here.

def signup(request):
    if request.method=="POST":
        username=request.POST['email']
        password=request.POST['password']
        confirm_password = request.POST.get('confirm_password', '')
        fname=request.POST['firstname']
        lname=request.POST['lastname']
        
        # Error dictionary for validation messages
        data = {'error': None}
        
        # Validation checks
        if not (username and password and confirm_password and fname and lname):
            data['error'] = "All fields are required."
            return render(request, 'notesapp/signup.html', data)

        if password != confirm_password:
            data['error'] = "Passwords do not match."
            return render(request, 'notesapp/signup.html', data)

        if len(password) < 8:
            data['error'] = "Password must be at least 8 characters long."
            return render(request, 'notesapp/signup.html', data)
        
        if User.objects.filter(username=username).exists():
            data['error']="User already exist"
            return render(request,'notesapp/signup.html',data)
        
        user = User.objects.create_user(username=username,password=password,first_name=fname,last_name=lname)
        messages.success(request, "Account created successfully. Please log in.")
        return redirect("/accounts/login/")
    else:
        return render(request,'notesapp/signup.html')

def login(request):
    if request.method == "POST":
        ema = request.POST['email']
        pword = request.POST['password']
        data = {"error" : None}
        
        if not (ema and pword):
            data['error'] = "Both email and password are required."
            return render(request, 'notesapp/login.html', data)
        
        user = auth.authenticate(username=ema, password=pword)
        if user is not None:
            auth.login(request, user)
            return redirect('/notes/newnote/')
        else:
            data['error'] = "Email or Password is incorrect"
            return render(request, 'notesapp/login.html', data)
    else:
        return render(request, 'notesapp/login.html')

@login_required
def logout(request):
    auth_logout(request)
    request.session.flush() 
    return redirect('mynotepad')