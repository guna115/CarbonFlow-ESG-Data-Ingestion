# Data Model Justification

## Core Philosophy
The data model for CarbonFlow is built on three pillars: **multi-tenancy**, **preservation of raw data**, and **immutability of audited records**. We isolate the raw ingestion from the normalized representation so that if normalization logic changes, we can re-process historical data without losing the original context.

## Schema Overview

### 1. Tenant
- `id`, `company_name`, `created_at`
- **Why**: Handles multi-tenancy. Every piece of data in the system ultimately traces back to a tenant, ensuring logical separation of client data.

### 2. Source
- `id`, `tenant_id`, `name`, `source_type` (SAP, UTILITY, TRAVEL), `uploaded_by`, `upload_time`
- **Why**: Tracks the origin of the data. When an auditor asks "Where did these 50 rows come from?", we can point to a specific file upload or API sync event, who triggered it, and when.

### 3. RawRecord
- `id`, `source_id`, `raw_json`, `status` (PENDING, PROCESSED, FAILED), `validation_errors`
- **Why**: Stores the exact JSON representation of a row from the source. SAP files have weird German headers; we store them as-is. If a record fails validation, it stays in the `RawRecord` table with its errors, preventing bad data from entering the emissions ledger while remaining visible to the analyst.

### 4. NormalizedEmissionRecord
- `id`, `tenant_id`, `raw_record_id`, `category`, `scope` (1, 2, or 3), `emission_value`, `normalized_unit`, `date_start`, `date_end`, `status` (PENDING, APPROVED, REJECTED)
- **Why**: The clean, standardized ledger of emissions. It categorizes data into Scopes 1/2/3 based on the GHG Protocol. It is linked 1:1 with a `RawRecord` so analysts can always trace an emission value back to its source row.

### 5. AuditLog
- `id`, `record_id`, `action` (CREATE, UPDATE, APPROVE, REJECT), `old_value`, `new_value`, `user_id`, `timestamp`
- **Why**: Essential for compliance. Any state change to a `NormalizedEmissionRecord` (especially approvals) is logged immutably here.

## Source of Truth Tracking
The `RawRecord` is the ultimate source of truth for *what was received*. The `NormalizedEmissionRecord` is the source of truth for *what is reported*. The `AuditLog` connects the two by tracking the human interventions (approvals/rejections) that authorized the reporting.

## Unit Normalization
Units are stored in the `RawRecord` as they arrive (e.g., "MWh", "Gallons"). The Normalization Engine converts them into standardized units (e.g., "kgCO2e", "kWh", "Liters") before saving to the `NormalizedEmissionRecord`. The `normalized_unit` field explicitly declares the unit of the `emission_value`.
