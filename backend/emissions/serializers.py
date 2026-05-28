from rest_framework import serializers
from .models import NormalizedEmissionRecord
from ingestion.serializers import RawRecordSerializer

class NormalizedEmissionRecordSerializer(serializers.ModelSerializer):
    raw_record = RawRecordSerializer(read_only=True)
    
    class Meta:
        model = NormalizedEmissionRecord
        fields = '__all__'
