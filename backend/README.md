# THO Platform Backend Starter

Backend skeleton for the course project. Local development now uses FastAPI + SQLite by default so the demo can run without Docker or a PostgreSQL service. The old PostgreSQL-oriented schema is still kept as reference.

This starter is built to match the project requirements:
- At least 10 API endpoints.
- Address management with 1-N relationship.
- Product and variant model (1-N).
- Image search endpoint pipeline placeholder.
- Basic tests and development guide.

## 1) Tech Stack

- Python 3.11+
- FastAPI
- Uvicorn
- SQLite for local demo data
- PostgreSQL schema kept for later production migration
- Pytest

## 2) Project Structure

```text
backend/
├── app/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── addresses.py
│   │   │   ├── auth.py
│   │   │   ├── cart.py
│   │   │   ├── health.py
│   │   │   ├── orders.py
│   │   │   ├── products.py
│   │   │   └── search.py
│   │   └── router.py
│   ├── core/
│   │   ├── config.py
│   │   └── logging_config.py
│   ├── db/
│   │   └── database.py
│   ├── models/
│   │   └── schemas.py
│   ├── services/
│   │   └── image_search_service.py
│   └── main.py
├── db/
│   └── schema.sql
├── tests/
│   └── test_api_smoke.py
├── .env.example
├── requirements.txt
└── README.md
```

## 3) Quick Start

### Step 1: Create virtual environment

Windows PowerShell:

```bash
python -m venv .venv
.venv\Scripts\Activate.ps1
```

### Step 2: Install dependencies

```bash
pip install -r requirements.txt
```

### Step 3: Create `.env`

```bash
copy .env.example .env
```

Default local database:

```bash
DATABASE_URL=sqlite:///db/tho_demo.sqlite
```

Then update values like `JWT_SECRET` and `IMAGE_API_KEY` when needed.

### Step 4: Run server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Open:
- Swagger UI: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/v1/health`

## 4) Endpoint Coverage (Starter)

Current routes included:

1. `GET /api/v1/health`
2. `POST /api/v1/auth/login`
3. `GET /api/v1/products`
4. `GET /api/v1/user/addresses`
5. `POST /api/v1/user/addresses`
6. `PUT /api/v1/user/addresses/{address_id}`
7. `PUT /api/v1/cart/item/{item_id}`
8. `DELETE /api/v1/cart/item/{item_id}`
9. `POST /api/v1/orders`
10. `GET /api/v1/orders/{order_id}`
11. `POST /api/v1/search/image`

This satisfies the minimum endpoint requirement and gives a base for business logic expansion.

## 4.1) Run With Docker (Recommended for localhost)

### Prerequisites

- Docker Desktop
- Docker Compose (included in modern Docker Desktop)

### Step 1: Create local env file

```bash
copy .env.example .env
```

### Step 2: Start backend + PostgreSQL

```bash
docker compose up --build
```

Services:
- API: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`
- PostgreSQL: `localhost:5432` (`postgres/postgres`)

Notes:
- `db/schema.sql` is auto-applied on first DB container initialization.
- If you need to re-init schema from scratch, run:

```bash
docker compose down -v
docker compose up --build
```

### Step 3: Stop services

```bash
docker compose down
```

## 5) SQL Design Notes

SQLite schema/seed file used by the local backend:

- `../db/03_sqlite_schema.sql`

The generated local database file is ignored by git:

- `db/tho_demo.sqlite`

PostgreSQL reference schema files remain in `db/01_schema.sql`, `db/02_seed_phase2.sql`, and `db/03_demo_workflow.sql`.

- Uses uppercase SQL keywords.
- Includes CTE examples:
  - Reset + set default address in one flow.
  - Create order and order_items in one transaction-like CTE flow.

When adding new SQL, keep using CTE style to match team rules.

## 6) Logging and Error Handling

- Global logging initialized in `app/core/logging_config.py`.
- Pipeline-sensitive logic (image search) uses `try/except` and logs with `logger.exception(...)`.
- Keep this pattern for external calls (vision API, payment, shipping).

## 7) Test

Run:

```bash
pytest -q
```

Included smoke tests:
- health endpoint
- login endpoint
- create address endpoint

## 8) Suggested Next Implementation Tasks

1. Finish replacing in-memory stores with SQLite repository methods.
2. Add API detail endpoints for products and workshops.
3. Add JWT auth middleware and role-based guards.
4. Implement real image recognition provider (Google Vision / AWS Rekognition).
5. Add transaction-safe order creation with stock locking.
6. Add workshop slot reservations with a 5-minute payment hold.
7. Expand tests to integration tests with a temporary SQLite database.

## 9) Backend Contribution Guide

Before commit:
- Run `pytest`.
- Check endpoint contracts in Swagger.
- Ensure `.env.example` stays updated when adding new env keys.
- Keep Python code PEP8-compliant.
- Keep SQL statements readable with CTE and uppercase keywords.
