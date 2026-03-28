# KasirKeren POS

KasirKeren is a fullstack cashier/POS app for small shops, built with React + FastAPI and integrated with Supabase and Midtrans.

## Features

- Dashboard with:
  - Daily revenue
  - Daily profit (sell price - purchase price)
  - Total orders
  - Top selling items
  - 7-day sales chart
- POS checkout:
  - Add items to cart
  - Cash payment
  - Midtrans Snap payment
- Item management:
  - Create, update, soft delete
  - Upload product image to Supabase Storage
  - Stock and price management
- Transaction history:
  - Grouped by date
  - Per-transaction detail modal
- Stock auto-deduction after successful payment

## Tech Stack

- Frontend: React 19, Vite 8, Tailwind CSS 4, Axios, Recharts
- Backend: FastAPI, Uvicorn, Pydantic
- Database and storage: Supabase (Postgres + Storage)
- Payment gateway: Midtrans Snap
- Containerization: Docker + Docker Compose

## Project Structure

```text
.
├── backend/              # FastAPI app
│   ├── main.py
│   ├── schemas.py
│   ├── supabase_client.py
│   ├── routers/
│   │   ├── items.py
│   │   ├── transactions.py
│   │   ├── dashboard.py
│   │   └── payment.py
│   └── services/
│       └── midtrans.py
├── frontend/             # React app
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── api/
│   └── index.html
└── docker-compose.yml
```

## Environment Variables

Create these files if they do not exist.

### `backend/.env`

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
MIDTRANS_IS_PRODUCTION=False
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxxxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxx
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5180
```

### `frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

Notes:
- In Docker production mode from this repo, frontend is built with `VITE_API_BASE_URL=http://localhost:8010`.
- Midtrans Snap script is loaded in `frontend/index.html`. Set `data-client-key` to your Midtrans client key.

## Run Locally (Without Docker)

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend available at `http://localhost:8000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend default is `http://localhost:5173`.

If port `5173` is in use:

```bash
npm run dev -- --port 5180
```

## Docker Setup

This repository includes production-style Docker setup with non-colliding host ports:

- Frontend: `http://localhost:5180`
- Backend API: `http://localhost:8010`

### Start

```bash
docker compose up --build -d
```

### Verify

```bash
docker compose ps
curl http://localhost:8010/
```

### Stop

```bash
docker compose down
```

## API Endpoints

Base backend URL:

- Local: `http://localhost:8000`
- Docker: `http://localhost:8010`

### Health

- `GET /`  
  Returns API status message.

### Items (`/api/items`)

- `GET /api/items`  
  List active items.
- `GET /api/items/{item_id}`  
  Get single item.
- `POST /api/items`  
  Create item.
- `PUT /api/items/{item_id}`  
  Update item.
- `DELETE /api/items/{item_id}`  
  Soft delete item (`is_active=false`).
- `POST /api/items/upload-image`  
  Upload image to Supabase Storage bucket `item-images`.

### Transactions (`/api/transactions`)

- `GET /api/transactions`  
  List transactions with `transaction_items`.
- `GET /api/transactions/{transaction_id}`  
  Get one transaction with its items.
- `POST /api/transactions`  
  Create pending transaction and snapshot item prices.

### Dashboard (`/api/dashboard`)

- `GET /api/dashboard/today`  
  Revenue, profit, total orders, top items for today.
- `GET /api/dashboard/chart`  
  Last 7 days revenue.

### Payment (`/api/payment`)

- `POST /api/payment/create-token`  
  Generate Midtrans Snap token for an order.
- `POST /api/payment/notification`  
  Midtrans webhook callback, updates payment status and deducts stock on success.
- `POST /api/payment/success/{order_id}`  
  Manual success endpoint for localhost/dev fallback (used when webhook cannot reach local server).

## Expected Supabase Tables

This backend expects at least:

- `items`
- `transactions`
- `transaction_items`

Fields used by code include:

- `items`: `id`, `name`, `price`, `purchase_price`, `stock`, `is_active`, `created_at`, `image_url`
- `transactions`: `id`, `order_id`, `total_amount`, `status`, `payment_type`, `snap_token`, `created_at`
- `transaction_items`: `transaction_id`, `item_id`, `item_name`, `quantity`, `unit_price`, `purchase_price`, `subtotal`

## Payment Flow (Current Implementation)

- Checkout always creates a transaction with `status="pending"`.
- Cash method calls `/api/payment/success/{order_id}?payment_type=Tunai`.
- Midtrans method:
  - Requests token from `/api/payment/create-token`
  - Opens Snap popup in frontend (`window.snap.pay`)
  - On success, frontend calls `/api/payment/success/{order_id}` as local fallback.
- Stock deduction happens when payment is marked `success`.

## Notes

- CORS middleware currently allows all origins (`allow_origins=["*"]`).
- `ALLOWED_ORIGINS` is loaded but not enforced in current backend code.
