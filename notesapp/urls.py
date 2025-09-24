from django.urls import path
from . import views

urlpatterns = [
	path('',views.index,name="mynotepad"),
	path('terms-conditions/', views.terms_conditions, name='terms_conditions'),
	path('privacy-policy/', views.privacy_policy, name='privacy_policy'),
	path('faq/', views.faq, name='faq'),
]