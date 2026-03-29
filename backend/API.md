# KasirKeren Backend API (FastAPI)

Production-style usage documentation for the Python backend API in this repository.

## 1. Overview

This backend is a FastAPI service for:

- Item management (`items`)
- Transaction creation and listing (`transactions`, `transaction_items`)
- Dashboard analytics
- Midtrans payment token + webhook handling
- CSV bulk import for items

Current API auth status:

- **No backend auth guards are implemented yet**.
- Any client with network access can call these endpoints.

## 2. Base URLs

- Local dev: `http://localhost:8000`
- Docker setup in this repo: `http://localhost:8010`

API route prefixes:

- `/api/items`
- `/api/transactions`
- `/api/dashboard`
- `/api/payment`

## 3. Content Types and Conventions

- JSON endpoints: `Content-Type: application/json`
- File upload endpoints:
  - `multipart/form-data` for image upload
  - `multipart/form-data` for CSV import
- Timestamps returned from Supabase are ISO8601 strings.
- Monetary values are stored/retrieved as numbers.

Response style:

- Success responses return JSON objects/arrays.
- Validation/business-rule errors typically return HTTP `400`.
- Missing resources return HTTP `404`.
- FastAPI/Pydantic validation failures return HTTP `422`.

## 4. Environment Variables

Required backend `.env` keys:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
MIDTRANS_IS_PRODUCTION=False
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxxxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxx
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5180
```

Notes:

- `ALLOWED_ORIGINS` is loaded but current CORS middleware allows `"*"` in code.
- `SUPABASE_SERVICE_KEY` must have permissions for reads/writes used by routers.

## 5. Core Data Models

## `ItemCreate`

```json
{
  "name": "Beng Beng",
  "price": 3000,
  "purchase_price": 2150,
  "stock": 17,
  "category": "Snack",
  "image_url": "https://example.com/image.jpg"
}
```

Rules:

- `price >= 0`
- `purchase_price >= 0`
- `stock >= 0`
- Additional business rule: `price >= purchase_price`

## `ItemUpdate`

All fields optional:

```json
{
  "price": 3500,
  "purchase_price": 2200,
  "stock": 12,
  "is_active": true
}
```

Rule still enforced after merge with existing data:

- final `price >= final purchase_price`

## `TransactionCreate`

```json
{
  "total_amount": 6000,
  "items": [
    {
      "id": 1,
      "name": "Beng Beng",
      "price": 3000,
      "purchase_price": 2150,
      "quantity": 2
    }
  ]
}
```

Rules:

- `items` cannot be empty
- each `quantity > 0`
- each item must exist and be active
- requested quantity cannot exceed current stock

## `PaymentTokenRequest`

```json
{
  "order_id": "ORDER-1711111111",
  "item_details": [
    {
      "id": "1",
      "name": "Beng Beng",
      "price": 3000,
      "quantity": 2
    }
  ]
}
```

## CSV Import Response Shape

```json
{
  "total_rows": 20,
  "processed_rows": 18,
  "created_count": 10,
  "updated_count": 8,
  "failed_count": 2,
  "errors": [
    {
      "row": 4,
      "item": "ABC Sweet Soy",
      "reason": "Harga jual tidak boleh lebih kecil dari harga beli"
    }
  ]
}
```

## 6. Endpoint Reference (with cURL)

Use one of these base URLs:

```bash
# Local dev
BASE_URL="http://localhost:8000"

# Docker
# BASE_URL="http://localhost:8010"
```

## 6.1 Health

### `GET /`

```bash
curl -X GET "$BASE_URL/"
```

Example response:

```json
{
  "message": "Cashier App API is running 🧾"
}
```

## 6.2 Items

### `GET /api/items`

Returns only active items (`is_active = true`), newest first.

```bash
curl -X GET "$BASE_URL/api/items"
```

### `GET /api/items/{item_id}`

```bash
curl -X GET "$BASE_URL/api/items/1"
```

### `POST /api/items`

```bash
curl -X POST "$BASE_URL/api/items" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Beng Beng",
    "price": 3000,
    "purchase_price": 2150,
    "stock": 17,
    "category": "Snack",
    "image_url": null
  }'
```

### `PUT /api/items/{item_id}`

```bash
curl -X PUT "$BASE_URL/api/items/1" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 3200,
    "purchase_price": 2200,
    "stock": 20
  }'
```

### `DELETE /api/items/{item_id}`

Soft delete (sets `is_active=false`):

```bash
curl -X DELETE "$BASE_URL/api/items/1"
```

### `POST /api/items/upload-image`

Upload image to Supabase Storage bucket `item-images`.

```bash
curl -X POST "$BASE_URL/api/items/upload-image" \
  -F "file=@/absolute/path/to/item.jpg"
```

Example response:

```json
{
  "image_url": "https://your-project.supabase.co/storage/v1/object/public/item-images/1711111111-item.jpg"
}
```

### `POST /api/items/import-csv`

Bulk create/update items from CSV.

Accepted header aliases (case-insensitive):

- `Item` / `name` / `nama`
- `Harga Jual` / `sellprice` / `price`
- `Harga Beli` / `purchaseprice` / `buyprice` / `modal`
- `QTY` / `stock` / `stok` / `quantity`

Supports delimiters `;` and `,`, plus UTF-8 BOM.

Rules:

- Match existing items by normalized name (case-insensitive)
- Existing item: update `price`, `purchase_price`, `stock`, set `is_active=true`
- New item: insert row
- Partial import: valid rows continue, invalid rows collected in `errors`

```bash
curl -X POST "$BASE_URL/api/items/import-csv" \
  -F "file=@/absolute/path/to/List\ Item.csv"
```

Sample CSV:

```csv
Item;Harga Jual;Harga Beli;QTY
Beng Beng;3.000;2.150;17
```

## 6.3 Transactions

### `GET /api/transactions`

Returns transactions including nested `transaction_items`.

```bash
curl -X GET "$BASE_URL/api/transactions"
```

### `GET /api/transactions/{transaction_id}`

```bash
curl -X GET "$BASE_URL/api/transactions/1"
```

### `POST /api/transactions`

Creates a pending transaction and snapshots item pricing in `transaction_items`.

```bash
curl -X POST "$BASE_URL/api/transactions" \
  -H "Content-Type: application/json" \
  -d '{
    "total_amount": 6000,
    "items": [
      {
        "id": 1,
        "name": "Beng Beng",
        "price": 3000,
        "purchase_price": 2150,
        "quantity": 2
      }
    ]
  }'
```

Example success response:

```json
{
  "order_id": "ORDER-1711111111",
  "transaction_id": 15
}
```

## 6.4 Dashboard

### `GET /api/dashboard/today`

Returns today’s success-only stats.

```bash
curl -X GET "$BASE_URL/api/dashboard/today"
```

Example response:

```json
{
  "total_revenue": 13000,
  "total_profit": 7000,
  "total_orders": 2,
  "top_items": [
    { "name": "jeruk", "qty": 2 },
    { "name": "bengbeng", "qty": 1 }
  ]
}
```

### `GET /api/dashboard/chart`

Returns last 7 days revenue:

```bash
curl -X GET "$BASE_URL/api/dashboard/chart"
```

Example response:

```json
[
  { "date": "2026-03-23", "revenue": 0 },
  { "date": "2026-03-24", "revenue": 5000 },
  { "date": "2026-03-25", "revenue": 0 },
  { "date": "2026-03-26", "revenue": 3000 },
  { "date": "2026-03-27", "revenue": 0 },
  { "date": "2026-03-28", "revenue": 0 },
  { "date": "2026-03-29", "revenue": 13000 }
]
```

## 6.5 Payment

### `POST /api/payment/create-token`

Creates Midtrans Snap token for an existing order.

```bash
curl -X POST "$BASE_URL/api/payment/create-token" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "ORDER-1711111111",
    "item_details": [
      {
        "id": "1",
        "name": "Beng Beng",
        "price": 3000,
        "quantity": 2
      }
    ]
  }'
```

Example response:

```json
{
  "snap_token": "TOKEN_PLACEHOLDER",
  "redirect_url": "https://app.sandbox.midtrans.com/snap/v2/vtweb/TOKEN_PLACEHOLDER"
}
```

### `POST /api/payment/notification`

Midtrans webhook callback. Backend maps payment status and deducts stock on success.

```bash
curl -X POST "$BASE_URL/api/payment/notification" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "ORDER-1711111111",
    "transaction_status": "settlement",
    "payment_type": "bank_transfer"
  }'
```

Example response:

```json
{
  "message": "OK"
}
```

### `POST /api/payment/success/{order_id}`

Manual development fallback (useful when webhook cannot reach localhost/private env).

```bash
curl -X POST "$BASE_URL/api/payment/success/ORDER-1711111111?payment_type=Tunai"
```

Example response:

```json
{
  "message": "Payment confirmed"
}
```

If already marked success:

```json
{
  "message": "Already paid"
}
```

## 7. Error Guide

Common business-rule errors (HTTP `400`):

```json
{ "detail": "Harga jual tidak boleh lebih kecil dari harga beli" }
```

```json
{ "detail": "Cart is empty" }
```

```json
{ "detail": "Stok tidak cukup untuk Beng Beng. Tersedia: 2" }
```

```json
{ "detail": "File harus berformat CSV" }
```

```json
{ "detail": "Kolom wajib tidak ditemukan: Item, QTY" }
```

Not found errors (HTTP `404`):

```json
{ "detail": "Item not found" }
```

```json
{ "detail": "Transaction not found" }
```

Validation errors (HTTP `422`) use FastAPI default format.

## 8. Workflow Guides

## Typical Cashier Flow

1. Load items from `GET /api/items`
2. Build cart on frontend
3. Create transaction via `POST /api/transactions`
4. Payment path:
   - Cash: call `POST /api/payment/success/{order_id}?payment_type=Tunai`
   - Midtrans:
     - call `POST /api/payment/create-token`
     - open Snap on frontend
     - wait for webhook `POST /api/payment/notification`
     - optionally call manual `/success/{order_id}` fallback in local/dev
5. On success status, backend deducts stock

## CSV Import Flow

1. Prepare CSV with required columns (`Item`, `Harga Jual`, `Harga Beli`, `QTY`)
2. Upload via `POST /api/items/import-csv`
3. Backend parses and validates row-by-row
4. Existing names are updated; new names are inserted
5. Check response summary and `errors` for rows that need correction

## 9. Quick Run (Local Backend)

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Interactive docs:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
