import pandas as pd
from datetime import datetime
from decimal import Decimal
from emissions.models import NormalizedEmissionRecord
from audit.models import AuditLog

# Normalization factors and mappings
# (Mock values for prototype purposes)
FUEL_EMISSION_FACTORS = {
    'diesel': 2.68, # kg CO2e per liter
    'petrol': 2.31,
}
ELECTRICITY_EMISSION_FACTORS = {
    'grid': 0.5, # kg CO2e per kWh (US average roughly)
}
TRAVEL_EMISSION_FACTORS = {
    'flight_short': 150, # kg CO2e per passenger
    'flight_long': 500,
    'hotel_night': 15,
}

def parse_date(date_str):
    if not date_str:
        return None
    date_str = str(date_str).strip()
    for fmt in ('%Y-%m-%d', '%d.%m.%Y', '%d/%m/%Y', '%m/%d/%Y', '%m-%d-%y'):
        try:
            return datetime.strptime(date_str, fmt).date()
        except ValueError:
            continue
    return None

def normalize_sap_record(raw_record, tenant):
    """
    Parses SAP CSV export.
    Expected reality handled: German headers (Kraftstoffart), odd dates (DD.MM.YYYY), inconsistent units (L, Gallons).
    """
    data = raw_record.raw_json
    
    # Try common variations
    fuel_type = (data.get('Kraftstoffart') or data.get('FuelType') or '').lower()
    qty_str = data.get('Menge') or data.get('Quantity') or 0
    unit = (data.get('Einheit') or data.get('Unit') or '').lower()
    date_str = data.get('Datum') or data.get('Date')
    
    try:
        qty = Decimal(str(qty_str))
    except:
        qty = Decimal(0)
        
    if qty < 0:
        raw_record.validation_errors = {'error': 'Negative quantity found'}
        raw_record.status = 'FAILED'
        raw_record.save()
        return None
        
    # Unit normalization
    if unit in ('gal', 'gallons'):
        qty = qty * Decimal('3.78541') # Convert to liters
        
    factor = FUEL_EMISSION_FACTORS.get(fuel_type, 2.5) # Default fallback
    emissions = qty * Decimal(str(factor))
    
    norm_record = NormalizedEmissionRecord.objects.create(
        tenant=tenant,
        raw_record=raw_record,
        category=f'SAP Fuel - {fuel_type}',
        scope='1',
        emission_value=emissions,
        normalized_unit='kgCO2e',
        date_start=parse_date(date_str),
        date_end=parse_date(date_str),
        status='PENDING'
    )
    
    raw_record.status = 'PROCESSED'
    raw_record.save()
    return norm_record

def normalize_utility_record(raw_record, tenant):
    """
    Parses Utility CSV export.
    Expected reality handled: kWh vs MWh, missing meter readings, cross-month billing.
    """
    data = raw_record.raw_json
    
    qty_str = data.get('Consumption') or data.get('Usage') or 0
    unit = (data.get('Unit') or data.get('UOM') or '').lower()
    start_date = data.get('BillingStartDate') or data.get('StartDate')
    end_date = data.get('BillingEndDate') or data.get('EndDate')
    
    try:
        qty = Decimal(str(qty_str))
    except:
        qty = Decimal(0)
        
    # Unit normalization
    if unit == 'mwh':
        qty = qty * 1000 # Convert to kWh
        
    emissions = qty * Decimal(str(ELECTRICITY_EMISSION_FACTORS['grid']))
    
    if emissions > 100000: # Suspiciously high
        raw_record.validation_errors = {'warning': 'Unusually high electricity consumption'}
        # But we still process it, analyst must review
        
    norm_record = NormalizedEmissionRecord.objects.create(
        tenant=tenant,
        raw_record=raw_record,
        category='Utility Electricity',
        scope='2',
        emission_value=emissions,
        normalized_unit='kgCO2e',
        date_start=parse_date(start_date),
        date_end=parse_date(end_date),
        status='PENDING'
    )
    
    raw_record.status = 'PROCESSED'
    raw_record.save()
    return norm_record

def normalize_travel_record(raw_record, tenant):
    """
    Parses Travel export (Navan/Concur style).
    Expected reality handled: Booking types, IATA codes without explicit distances.
    """
    data = raw_record.raw_json
    
    booking_type = (data.get('bookingType') or data.get('Category') or '').lower()
    origin = data.get('OriginIATA') or ''
    dest = data.get('DestinationIATA') or ''
    
    # In reality we'd calculate great-circle distance between IATA codes.
    # For MVP, we estimate based on whether it's a flight or hotel.
    emissions = Decimal(0)
    if 'flight' in booking_type or origin:
        # Mock logic: if both are US, short haul. Else long haul.
        emissions = Decimal(str(TRAVEL_EMISSION_FACTORS['flight_short']))
    elif 'hotel' in booking_type:
        nights = int(data.get('Nights') or 1)
        emissions = Decimal(str(TRAVEL_EMISSION_FACTORS['hotel_night'])) * nights
        
    norm_record = NormalizedEmissionRecord.objects.create(
        tenant=tenant,
        raw_record=raw_record,
        category=f'Corporate Travel - {booking_type}',
        scope='3',
        emission_value=emissions,
        normalized_unit='kgCO2e',
        date_start=parse_date(data.get('StartDate')),
        date_end=parse_date(data.get('EndDate')),
        status='PENDING'
    )
    
    raw_record.status = 'PROCESSED'
    raw_record.save()
    return norm_record

def process_raw_records(source):
    records = source.raw_records.filter(status='PENDING')
    tenant = source.tenant
    processed = 0
    
    for record in records:
        try:
            if source.source_type == 'SAP':
                normalize_sap_record(record, tenant)
            elif source.source_type == 'UTILITY':
                normalize_utility_record(record, tenant)
            elif source.source_type == 'TRAVEL':
                normalize_travel_record(record, tenant)
            processed += 1
        except Exception as e:
            record.status = 'FAILED'
            record.validation_errors = {'exception': str(e)}
            record.save()
            
    return processed
