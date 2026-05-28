# Real-World Sources Research & Sample Data

## 1. SAP (Fuel and Procurement)
- **Research:** SAP exports tabular data heavily via ALV Grid exports to CSV/XLSX. A major quirk of SAP is localization (e.g., column headers in German like `Kraftstoffart` for Fuel Type, `Menge` for Quantity). Dates often use European formatting (`DD.MM.YYYY`). Plant codes are arbitrary alphanumeric strings (e.g., `P001`).
- **Our Sample Data Shape:** A CSV with headers: `Date`, `PlantCode`, `Kraftstoffart`, `Menge`, `Einheit`.
- **What would break in reality:** Our current naive mapping assumes specific columns. If a client's SAP system uses a custom ABAP report that renames `Kraftstoffart` to `Z_FUEL_TYPE`, the parser would fail. In reality, we'd need a UI for the analyst to map client-specific columns to our internal schema once during onboarding.

## 2. Utility Data (Electricity)
- **Research:** Facilities teams often download CSVs from portals adhering to the Green Button standard, or vendor-specific CSVs. Key challenges: Billing periods almost never align with exact calendar months (e.g., Jan 14 to Feb 12). Units can be kWh, MWh, or even Therms.
- **Our Sample Data Shape:** A CSV with headers: `MeterID`, `StartDate`, `EndDate`, `Consumption`, `Unit`.
- **What would break in reality:** Missing end dates, overlapping billing periods across files, and rollover meter readings. Our MVP assumes the file explicitly provides total consumption for a defined period.

## 3. Corporate Travel (Navan/Concur)
- **Research:** Navan's API provides bookings as JSON. A flight booking includes `passengerInfo`, `bookingType`, `OriginIATA`, `DestinationIATA`, but crucially *not always the distance flown*. Hotels include `checkIn` and `checkOut` dates.
- **Our Sample Data Shape:** To fit our unified file-upload MVP, we simulated a flattened CSV export of an API response: `BookingID`, `Category`, `OriginIATA`, `DestinationIATA`, `StartDate`, `EndDate`, `Nights`.
- **What would break in reality:** Multi-leg flights under a single Booking ID, canceled trips that need to negate previous emissions, and ground transport that lacks clear distance metrics (e.g., Uber receipts only showing cost).
