# Architectural and Product Decisions

## 1. Ingestion via CSV/File Upload
**Decision:** We chose to use file uploads (CSV/XLSX) for all three sources in the prototype, rather than building live API integrations.
**Why:** Enterprise reality often involves manual exports (e.g., SAP background jobs emailing CSVs, or facilities teams downloading Green Button CSVs from utility portals). While APIs (like Navan's) exist, starting with file upload allows us to tackle the hardest part—data normalization and analyst review—without getting blocked by third-party API authentication setups during a 4-day sprint.

## 2. Asynchronous vs Synchronous Processing
**Decision:** In this prototype, file parsing and normalization happen synchronously during the HTTP request.
**Why:** To keep the infrastructure simple. 
**What we'd ask the PM:** "What is the expected maximum file size? If clients are uploading 500MB SAP exports, we must move parsing to an asynchronous worker queue (like Celery + Redis). Is that required for v1?"

## 3. Handling Missing Distances in Travel Data
**Decision:** When parsing travel data that only contains IATA airport codes, we fall back to a hardcoded "short-haul" vs "long-haul" emission factor, rather than integrating a geolocation distance API.
**Why:** Integrating a mapping/geolocation API adds external dependency risk for a prototype. We documented this as a known limitation.

## 4. Normalization Engine Strategy
**Decision:** We implemented specific parsers for `SAP`, `UTILITY`, and `TRAVEL`.
**Why:** It is impossible to build a "universal" parser for enterprise ESG data. We deliberately built a dispatch system where the `source_type` dictates which parsing logic is applied.

## 5. Scope of SAP Complexity Handled
**Decision:** We assumed the SAP export is a flat CSV derived from a standard ALV grid report, containing `Kraftstoffart` (Fuel Type), `Menge` (Quantity), and `Einheit` (Unit). 
**Ignored Complexity:** We ignored the complexity of resolving SAP internal Plant Codes to geographic locations. In a real system, we would need a lookup table linking SAP Plant ID -> Physical Address -> Grid Emission Factor.
