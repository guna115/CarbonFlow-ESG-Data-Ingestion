from django.urls import path
from .views import EmissionRecordListView, EmissionRecordApprovalView

urlpatterns = [
    path('records/', EmissionRecordListView.as_view(), name='record_list'),
    path('records/<int:pk>/review/', EmissionRecordApprovalView.as_view(), name='record_review'),
]
