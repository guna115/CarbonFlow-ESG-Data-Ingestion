from django.db import models
from tenants.models import Tenant

class Source(models.Model):
    SOURCE_TYPES = [
        ('SAP', 'SAP ERP'),
        ('UTILITY', 'Utility Bills'),
        ('TRAVEL', 'Corporate Travel'),
    ]
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='sources')
    name = models.CharField(max_length=255)
    source_type = models.CharField(max_length=20, choices=SOURCE_TYPES)
    uploaded_by = models.CharField(max_length=255) # Simplified for prototype
    upload_time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.source_type})"

class RawRecord(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PROCESSED', 'Processed'),
        ('FAILED', 'Failed'),
    ]
    source = models.ForeignKey(Source, on_delete=models.CASCADE, related_name='raw_records')
    raw_json = models.JSONField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    validation_errors = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f"RawRecord {self.id} from {self.source.name}"
