# Full-Stack BI Platform (NestJS + Angular + MongoDB + Python ML)

## Overview
This project is a monolithic Business Intelligence web application that supports:
- CSV upload for Sales and Purchases
- Data storage in MongoDB
- ML insights for Sales, Inventory, and Report health score
- Dashboards for visualization
- AI email recommendations via SMTP

## Repo Structure
- `backend/` NestJS REST API
- `frontend/` Angular app
- `ml/` Python ML scripts
- `samples/` Sample CSV files
- `postman/` Postman collection + env
- `docs/` Testing guide

## Prerequisites
- Node.js 20+
- MongoDB (local or cloud)
- Python 3.10+

## Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run start:dev
```

If your MongoDB URI does not include a database, set `MONGO_DB` in `.env`.

### ML Dependencies
```bash
pip install -r ml/requirements.txt
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Default Users
- Company Owner: `owner@demo.com` / `Password123!`
- Accountant: `accountant@demo.com` / `Password123!`

## Sample CSVs
- `samples/sales_sample.csv`
- `samples/purchases_sample.csv`

Purchases CSV may omit the `Total_Cost` column; the backend will compute it from `Quantity * Cost_Price`.

### CSV Formats
Sales:
`Date,Client,Product,Category,Quantity,Unit_Price,Total`

Purchases:
`Date,Supplier,Item,Type,Quantity,Cost_Price,Total_Cost`

### Data Reset Behavior
Uploading a Sales CSV replaces existing sales data for the company.
Uploading a Purchases CSV replaces existing purchases data for the company.
AI insights are stored as the latest result per module (older records are overwritten).

## API Endpoints (Core)
- `POST /auth/login`
- `POST /company/config`
- `GET /company/config`
- `POST /sales/upload`
- `GET /sales/revenue-over-time`
- `GET /sales/revenue-by-product`
- `POST /purchases/upload`
- `GET /purchases/list`
- `GET /inventory/stock`
- `GET /inventory/alerts`
- `GET /report/kpis`
- `GET /report/ai`
- `GET /ai/insights?module=sales|inventory|report`
- `POST /ai-agent/trigger`

## ML Execution
The backend runs the ML script automatically after CSV upload and report KPI refresh:
```bash
python ml/run_ml.py --module sales --company-id <companyId>
python ml/run_ml.py --module inventory --company-id <companyId>
python ml/run_ml.py --module report --company-id <companyId>
```

## Email (AI Agent)
Configure SMTP settings in `backend/.env` (see `.env.example`). The AI Agent sends summaries to the company email when CSVs are uploaded or health status changes.

## Financial Logic (KPIs)
- Revenue = sum of sales totals
- COGS = average stock purchase cost per item × quantity sold
- Overheads = purchases marked as Overhead
- Costs = COGS + Overheads

## Postman
Import:
- `postman/bi-platform.postman_collection.json`
- `postman/bi-platform.postman_environment.json`

## Testing Guide
See `docs/testing-guide.md`.
