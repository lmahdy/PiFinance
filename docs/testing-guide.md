# Testing Guide

## Backend Unit Tests
1. Auth login success
- Use `POST /auth/login` with `owner@demo.com` / `Password123!`.
- Expect `200` and `access_token`.

2. Auth login failure
- Use invalid password.
- Expect `401 Unauthorized`.

3. CSV validation errors
- Upload a CSV missing required columns.
- Expect `400` with error message.
- `Total_Cost` is optional for purchases; it will be computed if missing.

4. Report KPI correctness
- Upload sample sales and purchases CSVs.
- Call `GET /report/kpis`.
- Verify revenue, costs, profit, and taxes align with sample sums.

## ML Tests
1. Sales ML
- Upload `samples/sales_sample.csv`.
- Verify new document in `ai_insights` with `module: sales`.

2. Inventory ML
- Upload `samples/purchases_sample.csv`.
- Verify new document in `ai_insights` with `module: inventory`.

3. Report ML
- Call `GET /report/kpis`.
- Verify new document in `ai_insights` with `module: report`.

## Integration Tests
1. Upload Sales CSV ? Sales dashboard updates
- Upload sales sample.
- Call `GET /sales/revenue-over-time` and `GET /sales/revenue-by-product`.
- Expect non-empty arrays.

2. Upload Purchases CSV ? Inventory alerts appear
- Upload purchases sample.
- Call `GET /inventory/stock`.
- Expect non-empty stock list.
- Call `GET /inventory/alerts`.
- Expect empty or populated based on risk.

3. Final report shows KPIs + AI score
- Call `GET /report/kpis`.
- Call `GET /report/ai`.
- Expect `health_score` and `status`.

## Notes
- Uploading a Sales CSV replaces previous sales data for the company.
- Uploading a Purchases CSV replaces previous purchases data for the company.
- AI insights are overwritten per module (latest insight only).

## Automated E2E (Optional)
Run:
```bash
cd backend
npm run test:e2e
```

To validate AI insights via ML script in tests:
```bash
set RUN_ML_TESTS=true
npm run test:e2e
```

## Agent Tests
1. Trigger agent manually
- Call `POST /ai-agent/trigger`.
- Expect `sent: true` (ensure SMTP creds set).

2. Validate email content
- Check inbox for KPI, best/worst products, inventory risk, and health score.

## Manual Checklist
1. Start MongoDB.
2. Run NestJS backend.
3. Run ML dependencies install: `pip install -r ml/requirements.txt`.
4. Run Angular frontend.
5. Login as owner.
6. Upload sales CSV.
7. Upload purchases CSV.
8. Check dashboards + AI insights.
9. Trigger AI agent email.
