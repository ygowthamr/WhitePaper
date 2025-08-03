from django.shortcuts import render, redirect
from django.contrib.auth.models import User, auth
from django.contrib import messages
from django.contrib.auth import logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.hashers import make_password
from django.http import JsonResponse
import random
import smtplib
from email.mime.text import MIMEText

def signup(request):
    if request.method == "POST":
        username = request.POST['email']
        password = request.POST['password']
        confirm_password = request.POST.get('confirm_password', '')
        fname = request.POST['firstname']
        lname = request.POST['lastname']

        data = {'error': None}

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
            data['error'] = "User already exists"
            return render(request, 'notesapp/signup.html', data)

        User.objects.create_user(username=username, password=password, first_name=fname, last_name=lname)
        messages.success(request, "Account created successfully. Please log in.")
        return redirect("/accounts/login/")
    else:
        return render(request, 'notesapp/signup.html')

def login(request):
    if request.method == "POST":
        email = request.POST['email']
        password = request.POST['password']
        data = {"error": None}

        if not (email and password):
            data['error'] = "Both email and password are required."
            return render(request, 'notesapp/login.html', data)

        user = auth.authenticate(username=email, password=password)
        if user is not None:
            auth.login(request, user)
            return redirect('/')
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
def send_otp_email(to_email, otp):
    sender_email = "sakshambro730@gmail.com"
    sender_password = "cpbctxuuvvcnieae"

    subject = "Your Password Reset OTP"
    body = f"Your OTP for password reset is: {otp}. Do not share this with anyone."

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = sender_email
    msg["To"] = to_email

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, to_email, msg.as_string())
        server.quit()
        return True
    except Exception:
        return False
def password_reset(request):
    if request.method == "POST":
        email = request.POST.get("email")

        otp = random.randint(1000, 9999)
        request.session["reset_otp"] = otp
        request.session["reset_email"] = email

        if send_otp_email(email, otp):
            return JsonResponse({"message": "OTP sent successfully!"})
        else:
            return JsonResponse({"error": "Failed to send OTP"}, status=500)

    return render(request, "notesapp/password_reset.html")
def reset_password(request):
    if request.method == "POST":
        password = request.POST.get("password")
        confirm_password = request.POST.get("confirm_password")
        email = request.session.get("reset_email")

        if not request.session.get("otp_verified"):
            return JsonResponse({"error": "OTP verification required before resetting password!"}, status=400)

        if not (password and confirm_password):
            return JsonResponse({"error": "Both password fields are required."}, status=400)

        if password != confirm_password:
            return JsonResponse({"error": "Passwords do not match."}, status=400)

        if len(password) < 8:
            return JsonResponse({"error": "Password must be at least 8 characters long."}, status=400)

        try:
            user = User.objects.get(username=email)
            user.password = make_password(password)
            user.save()
            del request.session["reset_email"]
            del request.session["reset_otp"]
            del request.session["otp_verified"]
            return JsonResponse({"message": "Password reset successfully!"})
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found!"}, status=400)

    return render(request, "notesapp/reset_password.html")
