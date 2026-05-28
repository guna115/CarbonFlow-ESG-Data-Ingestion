# Deliberate Tradeoffs

## 1. Skipped: Automated Third-Party API Integration (e.g., Navan API Sync)
- **Why:** Integrating with real-world enterprise APIs (like SAP OData or Navan) requires setting up OAuth, managing secrets, and dealing with client-specific rate limits. For a 4-day prototype meant to demonstrate *data modeling and normalization logic*, the ROI on building a true API sync is low. We traded automated ingestion for file-based ingestion to guarantee we could focus heavily on the data processing engine and analyst UX.

## 2. Skipped: Complex Geolocation / Distance Calculation
- **Why:** When receiving travel data with only IATA codes (e.g., SFO -> LHR), accurately calculating emissions requires calculating the Great Circle Distance. This requires an external API (like Google Maps or a dedicated aviation API). We traded accuracy for speed by hardcoding a fallback heuristic (Flight = X kg CO2e) to prove the pipeline works, noting that the external call could easily be injected into the `normalize_travel_record` function later.

## 3. Skipped: Advanced Role-Based Access Control (RBAC)
- **Why:** The prototype hardcodes the "Analyst" view and user. While the data model is built for multi-tenancy, we did not build a full Django authentication flow with separate permissions for "Auditor", "Admin", and "Analyst" in the UI. Implementing Auth0 or Django sessions correctly takes time that was better spent on the core data review workflow (which is the actual hard part of the prompt).
