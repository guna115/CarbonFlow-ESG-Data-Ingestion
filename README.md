# CarbonFlow - Breathe ESG Tech Intern Assignment

CarbonFlow is a prototype ESG data ingestion and review platform built with Django and React. It ingests messy enterprise data from SAP, Utility bills, and Travel platforms, normalizes it, and provides an analyst dashboard for review and audit.

## Architecture
- **Backend:** Django, Django REST Framework, PostgreSQL
- **Frontend:** React, Vite, Tailwind CSS v4, React Query
- **Deployment:** Render (Backend) and Vercel (Frontend)

## Documentation Files (Required by Assignment)
Please review the following files in the root directory:
1. `MODEL.md` - Data model justification and audit trail design.
2. `DECISIONS.md` - Architectural choices and PM assumptions.
3. `TRADEOFFS.md` - Three things deliberately skipped.
4. `SOURCES.md` - Research on real-world data shapes and sample data design.

## Live App
**Frontend (Vercel):** *[Insert Vercel URL]*
**Backend (Render):** *[Insert Render URL]*

*Note: As an AI prototype built in a local environment, deployment configurations (`render.yaml` and `vercel.json`) are provided, but the actual cloud deployment must be triggered by pushing this repository to a GitHub account connected to Render/Vercel.*

## Local Setup

### Backend
1. `cd backend`
2. `python -m venv venv`
3. `source venv/Scripts/activate` (Windows) or `source venv/bin/activate` (Mac/Linux)
4. `pip install -r requirements.txt` (Note: ensure you freeze requirements first if running locally)
5. `python manage.py migrate`
6. `python manage.py runserver`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Sample Data for Testing
You can create a dummy CSV file with the following columns to test SAP ingestion:
`Date, PlantCode, Kraftstoffart, Menge, Einheit`
`2024-01-15, P001, Diesel, 500, Liters`
