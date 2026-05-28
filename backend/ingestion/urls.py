from django.urls import path
from .views import UploadAPIView

urlpatterns = [
    path('upload/', UploadAPIView.as_view(), name='upload_api'),
]
