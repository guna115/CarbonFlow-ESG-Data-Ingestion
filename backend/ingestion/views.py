from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Source, RawRecord
from .parsers import process_raw_records
from tenants.models import Tenant
import pandas as pd

class UploadAPIView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        file_obj = request.data.get('file')
        source_type = request.data.get('source_type')
        tenant_id = request.data.get('tenant_id')
        
        if not file_obj or not source_type or not tenant_id:
            return Response({'error': 'Missing required fields (file, source_type, tenant_id)'}, status=400)

        tenant = Tenant.objects.filter(id=tenant_id).first()
        if not tenant:
            return Response({'error': 'Tenant not found'}, status=404)

        source = Source.objects.create(
            tenant=tenant,
            name=file_obj.name,
            source_type=source_type,
            uploaded_by="Analyst" # Hardcoded for MVP
        )

        try:
            if file_obj.name.endswith('.csv'):
                df = pd.read_csv(file_obj)
            elif file_obj.name.endswith('.xlsx'):
                df = pd.read_excel(file_obj)
            else:
                return Response({'error': 'Unsupported file format. Please upload CSV or XLSX.'}, status=400)

            # Replace NaNs with None for JSON serialization
            df = df.where(pd.notnull(df), None)
            records = df.to_dict('records')

            raw_records = []
            for row in records:
                raw_records.append(RawRecord(
                    source=source,
                    raw_json=row,
                    status='PENDING'
                ))
            
            RawRecord.objects.bulk_create(raw_records)

            # Trigger normalization
            process_raw_records(source)
            
            return Response({
                'message': 'File uploaded and processed successfully',
                'source_id': source.id,
                'rows_processed': len(records)
            })

        except Exception as e:
            source.delete() # rollback
            return Response({'error': str(e)}, status=500)
