from django.utils.deprecation import MiddlewareMixin
from django.contrib.sessions.models import Session
from django.utils import timezone

class SessionValidationMiddleware(MiddlewareMixin):
    def process_request(self, request):
        session_key = request.session.session_key
        if session_key:
            try:
                session = Session.objects.get(session_key=session_key)
                if session.expire_date < timezone.now():
                    request.session.flush()
            except Session.DoesNotExist:
                request.session.flush()