from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.shortcuts import render

def verify_otp(request):
    if request.method == "POST":
        entered_otp = request.POST.get("otp")
        stored_otp = request.session.get("reset_otp")

        if str(entered_otp) == str(stored_otp):
            request.session["otp_verified"] = True
            return JsonResponse({"message": "OTP verified successfully!", "redirect": "reset-password/"})
        else:
            return JsonResponse({"error": "Invalid OTP. Please try again."}, status=400)

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

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('notesapp.urls')),
    path('accounts/', include('accounts.urls')),
    path('verify-otp/', verify_otp, name='verify-otp'),
    path('reset-password/', reset_password, name='reset-password'),
    path('notes/', include('notes.urls')),
    path('allauth/', include('allauth.urls')),
]
