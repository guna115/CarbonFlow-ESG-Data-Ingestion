from django.db import models
from tenants.models import Tenant
from ingestion.models import RawRecord

class NormalizedEmissionRecord(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending Review'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]
    SCOPE_CHOICES = [
        ('1', 'Scope 1'),
        ('2', 'Scope 2'),
        ('3', 'Scope 3'),
    ]
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='emission_records')
    raw_record = models.OneToOneField(RawRecord, on_delete=models.CASCADE, related_name='normalized_record')
    category = models.CharField(max_length=255)
    scope = models.CharField(max_length=1, choices=SCOPE_CHOICES)
    emission_value = models.DecimalField(max_digits=18, decimal_places=4, null=True, blank=True)
    normalized_unit = models.CharField(max_length=50, null=True, blank=True)
    date_start = models.DateField(null=True, blank=True)
    date_end = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')

    def __str__(self):
        return f"Emission {self.id} - {self.category} ({self.scope})"
