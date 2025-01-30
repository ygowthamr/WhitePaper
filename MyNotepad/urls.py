"""MyNotepad URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""


from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.shortcuts import render

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
            user = User.objects.get(username=email)  # Assuming username is the email
            user.password = make_password(password)  # Hash the new password
            user.save()
            del request.session["reset_email"]  # Clear session data
            del request.session["reset_otp"]
            del request.session["otp_verified"]
            return JsonResponse({"message": "Password reset successfully!"})
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found!"}, status=400)

    return render(request, "notesapp/reset_password.html")

from django.contrib import admin
from django.urls import path
from django.urls.conf import include
from django.http import JsonResponse
def verify_otp(request):
    if request.method == "POST":
        entered_otp = request.POST.get("otp")
        stored_otp = request.session.get("reset_otp")

        if str(entered_otp) == str(stored_otp):
            request.session["otp_verified"] = True  # Store verification status
            return JsonResponse({"message": "OTP verified successfully!", "redirect": "reset-password/"})
        else:
            return JsonResponse({"error": "Invalid OTP. Please try again."}, status=400)

urlpatterns = [
    path('admin/', admin.site.urls),
	path('',include('notesapp.urls')),
    path('accounts/',include('accounts.urls')),
    path('verify-otp/', verify_otp, name='verify-otp'),
    path('reset-password/', reset_password, name='verify-otp'),
    path('notes/', include('notes.urls')),
    
]
