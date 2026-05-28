from django.db import models
from emissions.models import NormalizedEmissionRecord

class AuditLog(models.Model):
    ACTION_CHOICES = [
        ('CREATE', 'Create'),
        ('UPDATE', 'Update'),
        ('APPROVE', 'Approve'),
        ('REJECT', 'Reject'),
    ]
    record = models.ForeignKey(NormalizedEmissionRecord, on_delete=models.CASCADE, related_name='audit_logs')
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    old_value = models.JSONField(null=True, blank=True)
    new_value = models.JSONField(null=True, blank=True)
    user_id = models.CharField(max_length=255) # Simplified for prototype
    timestamp = models.DateTimeField(auto_now_add=True)
    comments = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.action} on Record {self.record.id}"
