from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics
from .models import NormalizedEmissionRecord
from .serializers import NormalizedEmissionRecordSerializer
from audit.models import AuditLog

class EmissionRecordListView(generics.ListAPIView):
    serializer_class = NormalizedEmissionRecordSerializer
    
    def get_queryset(self):
        queryset = NormalizedEmissionRecord.objects.all().order_by('-id')
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        return queryset

class EmissionRecordApprovalView(APIView):
    def post(self, request, pk):
        try:
            record = NormalizedEmissionRecord.objects.get(pk=pk)
        except NormalizedEmissionRecord.DoesNotExist:
            return Response({'error': 'Record not found'}, status=404)

        if record.status in ['APPROVED', 'REJECTED']:
            return Response({'error': 'Record is already reviewed and locked.'}, status=400)

        action = request.data.get('action') # 'APPROVE' or 'REJECT'
        comments = request.data.get('comments', '')
        user_id = request.data.get('user_id', 'Analyst')

        if action not in ['APPROVE', 'REJECT']:
            return Response({'error': 'Invalid action'}, status=400)

        old_status = record.status
        record.status = action + 'D' # APPROVED or REJECTED
        record.save()

        AuditLog.objects.create(
            record=record,
            action=action,
            old_value={'status': old_status},
            new_value={'status': record.status},
            user_id=user_id,
            comments=comments
        )

        return Response({'message': f'Record {action.lower()}d successfully', 'status': record.status})
