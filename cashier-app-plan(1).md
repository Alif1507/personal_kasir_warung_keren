# 🧾 Cashier App — Development Plan

> **Stack:** ReactJS (Frontend) · FastAPI (Backend) · Supabase (Database + Storage) · Midtrans (Payment Gateway)
>
> **IDE MCP Servers:** Supabase MCP (database management) · Google Stitch MCP (UI design) — both run locally in Cursor / VS Code

---

## 📌 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Dependencies](#2-tech-stack--dependencies)
3. [IDE MCP Setup](#3-ide-mcp-setup)
4. [Project Structure](#4-project-structure)
5. [Database Design](#5-database-design)
6. [Supabase Setup](#6-supabase-setup)
7. [Backend (FastAPI)](#7-backend-fastapi)
8. [Frontend (ReactJS)](#8-frontend-reactjs)
9. [Midtrans Integration](#9-midtrans-integration)
10. [API Endpoints Reference](#10-api-endpoints-reference)
11. [Development Phases](#11-development-phases)
12. [Environment Configuration](#12-environment-configuration)
13. [Running the App](#13-running-the-app)

---

## 1. Project Overview

A full-featured **Point of Sale (POS) / Cashier Web App** with:

- 📊 **Dashboard** — shows today's total sales, total profit (laba), number of transactions, top-selling items, and a sales chart
- 🛒 **POS Screen** — browse items, add to cart, and process payment
- 📦 **Item Management** — add, update, and delete items (name, harga jual, stock, category, image)
- 🔄 **Restock Log** — record each restock batch with harga beli per unit; profit is calculated as harga jual − harga beli at time of sale
- 💳 **Midtrans Payment Gateway** — integrates Snap popup for seamless payment (QRIS, GoPay, bank transfer, credit card, etc.)
- 🔔 **Webhook Handler** — listens to Midtrans payment notifications to update transaction status

---

## 2. Tech Stack & Dependencies

### Backend
```
Python 3.10+
fastapi
uvicorn[standard]
supabase              # Supabase Python client
python-dotenv
midtransclient
python-multipart
Pillow                # optional, Supabase Storage handles file hosting
```

Install:
```bash
pip install fastapi uvicorn[standard] supabase python-dotenv midtransclient python-multipart Pillow
```

### Frontend
```
Node 18+
react + react-dom
react-router-dom
axios
@supabase/supabase-js  # Supabase JS client (realtime, storage, auth)
recharts               # sales charts
tailwindcss            # styling
lucide-react           # icons
react-hot-toast        # notifications
```

Install:
```bash
npx create-react-app cashier-frontend
cd cashier-frontend
npm install axios react-router-dom @supabase/supabase-js recharts lucide-react react-hot-toast
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## 3. IDE MCP Setup

Both MCP servers run **locally inside your IDE** (Cursor or VS Code). They are not connected to Claude.ai — you invoke them directly while coding via your editor's MCP/agent panel.

### 🗄️ Supabase MCP (Local IDE)

The Supabase MCP lets you manage your Supabase project without leaving your editor. Use it to:

- Create and modify tables via natural language ("create a transactions table with these columns…")
- Run SQL queries to inspect or seed data
- Manage storage buckets and RLS policies
- Check logs and project settings

**Setup in `.cursor/mcp.json` or `.vscode/mcp.json`:**
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase@latest", "--access-token", "YOUR_SUPABASE_ACCESS_TOKEN"]
    }
  }
}
```

Get your access token from: https://supabase.com/dashboard/account/tokens

**Useful prompts while building:**
```
"Create the items table with id, name, price, stock, category, image_url, is_active, created_at"
"Show me all transactions from today"
"Add an index on transactions.created_at"
"Create a public storage bucket called item-images"
"Enable RLS on the items table and allow all for service role"
```

---

### 🎨 Google Stitch MCP (Local IDE)

Google Stitch is your custom local MCP for UI design. Use it to generate, preview, and iterate on UI components directly from your IDE while building the React frontend.

**Setup in `.cursor/mcp.json` or `.vscode/mcp.json`:**
```json
{
  "mcpServers": {
    "google-stitch": {
      "command": "node",
      "args": ["/path/to/your/stitch-mcp/index.js"]
    }
  }
}
```

> Update the path to wherever your local Stitch MCP server is installed.

**How to use it in your workflow:**

Use Google Stitch MCP to design components before writing code. Describe what you need and get back layout structures, color tokens, or component blueprints you can drop straight into your React files.

**Example prompts while building the cashier app:**
```
"Design a POS item card grid with image, name, price, and an add-to-cart button"
"Create a dashboard stat card — total revenue, order count, top items"
"Design a sidebar cart with item list, quantity controls, subtotal, and a checkout button"
"Make a modal form for adding/editing items with image upload preview"
"Design a transaction history table with status badges (pending, success, failed)"
```

**Design tokens to stay consistent:**
```
Primary : #6366f1  (indigo)
Success : #22c55e  (green)
Danger  : #ef4444  (red)
Warning : #f59e0b  (amber)
Font    : Inter
Radius  : rounded-xl (12px)
```

---

## 4. Project Structure

```
cashier-app/
├── backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── supabase_client.py       # Supabase client singleton
│   ├── schemas.py               # Pydantic schemas
│   ├── routers/
│   │   ├── items.py             # CRUD endpoints for items
│   │   ├── transactions.py      # Create transaction, get history + profit
│   │   ├── dashboard.py         # Dashboard stats + today's profit (laba)
│   │   ├── restock.py           # Log restock batches (harga beli per unit)
│   │   └── payment.py           # Midtrans Snap token + webhook
│   ├── services/
│   │   └── midtrans.py          # Midtrans client logic
│   └── .env
│
└── frontend/
    ├── public/
    │   └── index.html           # Load Snap.js here
    └── src/
        ├── api/
        │   ├── axios.js         # axios instance with base URL
        │   └── supabase.js      # Supabase JS client instance
        ├── components/
        │   ├── Navbar.jsx
        │   ├── ItemCard.jsx
        │   ├── Cart.jsx
        │   └── SalesChart.jsx
        ├── pages/
        │   ├── Dashboard.jsx    # Shows revenue + profit today
        │   ├── POS.jsx
        │   ├── Items.jsx
        │   ├── Transactions.jsx # Shows profit per transaction
        │   └── Restock.jsx      # Log harga beli per batch
        ├── App.jsx
        └── main.jsx
```

---

## 5. Database Design

> Tables are created via the **Supabase MCP in your IDE** or the Supabase Dashboard SQL editor. No Alembic or manual migrations needed — Supabase manages PostgreSQL for you.

### Table: `items`
| Column     | Type        | Notes                            |
|------------|-------------|----------------------------------|
| id         | bigint      | Primary key, auto-increment      |
| name       | text        | Item name                        |
| price      | numeric     | Harga jual (selling price) IDR   |
| stock      | integer     | Available quantity               |
| category   | text        | e.g., Food, Drink, Other         |
| image_url  | text        | Public URL from Supabase Storage |
| is_active  | boolean     | Soft delete flag, default true   |
| created_at | timestamptz | Auto timestamp                   |

### Table: `restock_logs`
> Each time you restock an item, log it here with the harga beli for that batch. When a sale happens, the backend looks up the **latest restock** before that sale to get the cost price at that moment.

| Column       | Type        | Notes                                        |
|--------------|-------------|----------------------------------------------|
| id           | bigint      | Primary key                                  |
| item_id      | bigint      | FK → items.id                                |
| quantity     | integer     | Units restocked in this batch                |
| cost_price   | numeric     | Harga beli per unit for this batch (IDR)     |
| note         | text        | Optional note, e.g. "Supplier A, batch #12"  |
| restocked_at | timestamptz | Auto timestamp                               |

### Table: `transactions`
| Column       | Type        | Notes                               |
|--------------|-------------|-------------------------------------|
| id           | bigint      | Primary key                         |
| order_id     | text        | Unique, e.g. `ORDER-1711234567`     |
| total_amount | numeric     | Total harga jual in IDR             |
| total_cost   | numeric     | Total harga beli (sum of cost_price × qty) |
| total_profit | numeric     | total_amount − total_cost           |
| status       | text        | pending / success / failed / expire |
| payment_type | text        | e.g. gopay, credit_card, qris       |
| snap_token   | text        | Midtrans Snap token                 |
| created_at   | timestamptz | Auto timestamp                      |

### Table: `transaction_items`
| Column         | Type    | Notes                                        |
|----------------|---------|----------------------------------------------|
| id             | bigint  | Primary key                                  |
| transaction_id | bigint  | FK → transactions.id                         |
| item_id        | bigint  | FK → items.id                                |
| item_name      | text    | Snapshot of name at time of sale             |
| quantity       | integer |                                              |
| unit_price     | numeric | Snapshot of harga jual at time of sale       |
| cost_price     | numeric | Snapshot of harga beli from latest restock   |
| subtotal       | numeric | unit_price × quantity                        |
| profit         | numeric | (unit_price − cost_price) × quantity         |

---

## 6. Supabase Setup

### 1. Create a Project

Go to https://supabase.com → New Project. Save your **Project URL**, **anon key**, and **service_role key** from Settings → API.

### 2. Create Tables

Use **Supabase MCP in your IDE** (recommended) or paste into the Supabase SQL editor:

```sql
create table items (
  id bigint generated always as identity primary key,
  name text not null,
  price numeric not null,
  stock integer not null default 0,
  category text,
  image_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table transactions (
  id bigint generated always as identity primary key,
  order_id text unique not null,
  total_amount numeric not null,          -- sum of harga jual × qty
  total_cost   numeric not null default 0, -- sum of harga beli × qty
  total_profit numeric not null default 0, -- total_amount - total_cost
  status text default 'pending',
  payment_type text,
  snap_token text,
  created_at timestamptz default now()
);

create table transaction_items (
  id bigint generated always as identity primary key,
  transaction_id bigint references transactions(id) on delete cascade,
  item_id bigint references items(id),
  item_name text not null,
  quantity integer not null,
  unit_price numeric not null,   -- harga jual snapshot
  cost_price numeric not null,   -- harga beli snapshot from latest restock
  subtotal   numeric not null,   -- unit_price × quantity
  profit     numeric not null    -- (unit_price - cost_price) × quantity
);

-- Restock log: tracks harga beli per batch
create table restock_logs (
  id           bigint generated always as identity primary key,
  item_id      bigint references items(id) on delete cascade,
  quantity     integer not null,
  cost_price   numeric not null,   -- harga beli per unit for this batch
  note         text,
  restocked_at timestamptz default now()
);

create index idx_transactions_created_at on transactions(created_at);
create index idx_transactions_status on transactions(status);
create index idx_restock_logs_item_id on restock_logs(item_id, restocked_at desc);
```

### 3. Enable RLS

```sql
alter table items enable row level security;
alter table transactions enable row level security;
alter table transaction_items enable row level security;
alter table restock_logs enable row level security;
-- Backend uses service_role key which bypasses RLS by default
-- Add policies here later if you add direct frontend queries
```

### 4. Storage Bucket

Via Supabase MCP: `"Create a public storage bucket called item-images"`

Or via SQL:
```sql
insert into storage.buckets (id, name, public)
values ('item-images', 'item-images', true);
```

### 5. Backend Client (`supabase_client.py`)

```python
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY"),  # service key — backend only, never expose
)
```

### 6. Frontend Client (`src/api/supabase.js`)

```javascript
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY  // anon key only on frontend
);
```

---

## 7. Backend (FastAPI)

### `main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import items, transactions, dashboard, payment, restock

app = FastAPI(title="Cashier App API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(items.router,        prefix="/api/items",        tags=["Items"])
app.include_router(transactions.router, prefix="/api/transactions", tags=["Transactions"])
app.include_router(dashboard.router,    prefix="/api/dashboard",    tags=["Dashboard"])
app.include_router(restock.router,      prefix="/api/restock",      tags=["Restock"])
app.include_router(payment.router,      prefix="/api/payment",      tags=["Payment"])
```

### `services/midtrans.py`

```python
import midtransclient, os
from dotenv import load_dotenv

load_dotenv()

snap = midtransclient.Snap(
    is_production=os.getenv("MIDTRANS_IS_PRODUCTION", "False") == "True",
    server_key=os.getenv("MIDTRANS_SERVER_KEY"),
    client_key=os.getenv("MIDTRANS_CLIENT_KEY"),
)

def create_snap_token(order_id, gross_amount, customer_details, item_details):
    param = {
        "transaction_details": {"order_id": order_id, "gross_amount": gross_amount},
        "item_details": item_details,
        "customer_details": customer_details,
        "credit_card": {"secure": True},
    }
    tx = snap.create_transaction(param)
    return tx["token"], tx["redirect_url"]
```

### `routers/payment.py` — Snap Token + Webhook

```python
from fastapi import APIRouter, Request
from supabase_client import supabase
from services.midtrans import snap, create_snap_token

router = APIRouter()

@router.post("/create-token")
def create_payment_token(payload: dict):
    order_id = payload["order_id"]
    tx = supabase.table("transactions").select("*").eq("order_id", order_id).single().execute().data
    token, redirect_url = create_snap_token(
        order_id=order_id,
        gross_amount=int(tx["total_amount"]),
        customer_details={"first_name": "Customer"},
        item_details=payload["item_details"],
    )
    supabase.table("transactions").update({"snap_token": token}).eq("order_id", order_id).execute()
    return {"snap_token": token, "redirect_url": redirect_url}

@router.post("/notification")
async def payment_notification(request: Request):
    body = await request.json()
    res = snap.transactions.notification(body)
    order_id = res["order_id"]
    ts = res["transaction_status"]
    fs = res.get("fraud_status", "")

    if ts == "capture":
        status = "success" if fs == "accept" else "challenge"
    elif ts == "settlement":
        status = "success"
    elif ts in ("cancel", "deny", "expire"):
        status = "failed"
    else:
        status = "pending"

    supabase.table("transactions").update({
        "status": status,
        "payment_type": res.get("payment_type", "")
    }).eq("order_id", order_id).execute()

    return {"message": "OK"}
```

### `routers/dashboard.py`

```python
from fastapi import APIRouter
from supabase_client import supabase
from datetime import date

router = APIRouter()

@router.get("/today")
def get_today_stats():
    today = date.today().isoformat()
    result = supabase.table("transactions") \
        .select("id, total_amount, total_cost, total_profit, transaction_items(item_name, quantity)") \
        .eq("status", "success") \
        .gte("created_at", f"{today}T00:00:00") \
        .lte("created_at", f"{today}T23:59:59") \
        .execute()

    txs = result.data
    item_counts = {}
    for t in txs:
        for item in t.get("transaction_items", []):
            n = item["item_name"]
            item_counts[n] = item_counts.get(n, 0) + item["quantity"]

    top = sorted(item_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    return {
        "total_revenue": sum(t["total_amount"] for t in txs),
        "total_cost":    sum(t["total_cost"]   for t in txs),
        "total_profit":  sum(t["total_profit"] for t in txs),  # laba hari ini
        "total_orders":  len(txs),
        "top_items":     [{"name": k, "qty": v} for k, v in top],
    }
```

### `routers/restock.py`

```python
from fastapi import APIRouter
from supabase_client import supabase

router = APIRouter()

@router.post("/")
def log_restock(payload: dict):
    """
    Log a restock batch for an item.
    payload: { item_id, quantity, cost_price, note? }
    Also increments the item's stock count.
    """
    item_id    = payload["item_id"]
    quantity   = payload["quantity"]
    cost_price = payload["cost_price"]

    # Insert restock log
    supabase.table("restock_logs").insert({
        "item_id":    item_id,
        "quantity":   quantity,
        "cost_price": cost_price,
        "note":       payload.get("note", ""),
    }).execute()

    # Increment stock on the item
    item = supabase.table("items").select("stock").eq("id", item_id).single().execute().data
    new_stock = item["stock"] + quantity
    supabase.table("items").update({"stock": new_stock}).eq("id", item_id).execute()

    return {"message": "Restock logged", "new_stock": new_stock}

@router.get("/{item_id}")
def get_restock_history(item_id: int):
    """Get all restock batches for an item, newest first."""
    result = supabase.table("restock_logs") \
        .select("*") \
        .eq("item_id", item_id) \
        .order("restocked_at", desc=True) \
        .execute()
    return result.data

@router.get("/{item_id}/latest-cost")
def get_latest_cost(item_id: int):
    """Get the cost_price from the most recent restock batch for an item."""
    result = supabase.table("restock_logs") \
        .select("cost_price, restocked_at") \
        .eq("item_id", item_id) \
        .order("restocked_at", desc=True) \
        .limit(1) \
        .execute()
    if not result.data:
        return {"cost_price": 0}
    return {"cost_price": result.data[0]["cost_price"]}
```

### Profit Calculation on Transaction Creation (`routers/transactions.py`)

When a transaction is created, the backend looks up the **latest restock cost** for each item before computing profit:

```python
@router.post("/")
def create_transaction(payload: dict):
    import time
    order_id = f"ORDER-{int(time.time())}"
    total_amount = 0
    total_cost   = 0
    line_items   = []

    for item in payload["items"]:
        # Look up latest harga beli for this item
        restock = supabase.table("restock_logs") \
            .select("cost_price") \
            .eq("item_id", item["id"]) \
            .order("restocked_at", desc=True) \
            .limit(1) \
            .execute().data

        cost_price = restock[0]["cost_price"] if restock else 0
        subtotal   = item["price"] * item["quantity"]
        profit     = (item["price"] - cost_price) * item["quantity"]

        total_amount += subtotal
        total_cost   += cost_price * item["quantity"]

        line_items.append({
            "item_id":    item["id"],
            "item_name":  item["name"],
            "quantity":   item["quantity"],
            "unit_price": item["price"],
            "cost_price": cost_price,       # snapshot harga beli
            "subtotal":   subtotal,
            "profit":     profit,
        })

    total_profit = total_amount - total_cost

    # Insert transaction header
    tx = supabase.table("transactions").insert({
        "order_id":     order_id,
        "total_amount": total_amount,
        "total_cost":   total_cost,
        "total_profit": total_profit,
        "status":       "pending",
    }).execute().data[0]

    # Insert line items
    for li in line_items:
        li["transaction_id"] = tx["id"]
    supabase.table("transaction_items").insert(line_items).execute()

    # Deduct stock (deduct after payment confirmation in webhook for stricter flow)
    for item in payload["items"]:
        curr = supabase.table("items").select("stock").eq("id", item["id"]).single().execute().data
        supabase.table("items").update({"stock": curr["stock"] - item["quantity"]}).eq("id", item["id"]).execute()

    return {"order_id": order_id, "total_amount": total_amount, "total_profit": total_profit}
```

---

## 8. Frontend (ReactJS)

### `POS.jsx` — Checkout with Snap

```jsx
// public/index.html: add before </body>
// <script src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key="YOUR_CLIENT_KEY"></script>

const handleCheckout = async () => {
  const txRes = await api.post("/api/transactions", { items: cart, total_amount: totalAmount });

  const tokenRes = await api.post("/api/payment/create-token", {
    order_id: txRes.data.order_id,
    item_details: cart.map(i => ({ id: String(i.id), name: i.name, price: i.price, quantity: i.quantity })),
  });

  window.snap.pay(tokenRes.data.snap_token, {
    onSuccess: () => { toast.success("Payment successful!"); clearCart(); },
    onPending: () => toast("Waiting for payment..."),
    onError:   () => toast.error("Payment failed"),
    onClose:   () => toast("Popup closed"),
  });
};
```

### `Items.jsx` — Image Upload to Supabase Storage

```jsx
import { supabase } from "../api/supabase";

const uploadImage = async (file) => {
  const filename = `${Date.now()}-${file.name}`;
  await supabase.storage.from("item-images").upload(filename, file);
  const { data } = supabase.storage.from("item-images").getPublicUrl(filename);
  return data.publicUrl;
};
```

### `Dashboard.jsx` — Revenue + Profit Cards + Chart

```jsx
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import api from "../api/axios";

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/api/dashboard/today").then(res => setStats(res.data));
  }, []);

  const fmt = (n) => `Rp ${Number(n ?? 0).toLocaleString("id-ID")}`;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard — Hari Ini</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Penjualan" value={fmt(stats?.total_revenue)} color="indigo" />
        <StatCard label="Total Modal"     value={fmt(stats?.total_cost)}    color="amber" />
        <StatCard label="Laba Bersih"     value={fmt(stats?.total_profit)}  color="green" />
        <StatCard label="Jumlah Order"    value={stats?.total_orders ?? 0}  color="gray" />
      </div>

      {/* Top Items Bar Chart */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="font-semibold mb-3">Item Terlaris Hari Ini</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={stats?.top_items}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="qty" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

### `Transactions.jsx` — History with Profit Column

```jsx
// Columns: Order ID | Waktu | Total Penjualan | Total Modal | Laba | Payment | Status
export default function Transactions() {
  const [txs, setTxs] = useState([]);

  useEffect(() => {
    api.get("/api/transactions").then(res => setTxs(res.data));
  }, []);

  const fmt = (n) => `Rp ${Number(n ?? 0).toLocaleString("id-ID")}`;
  const statusColor = { success: "green", pending: "amber", failed: "red" };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Riwayat Transaksi</h1>
      <table className="w-full text-sm bg-white rounded-xl shadow overflow-hidden">
        <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
          <tr>
            {["Order ID","Waktu","Penjualan","Modal","Laba","Pembayaran","Status"].map(h => (
              <th key={h} className="px-4 py-3 text-left">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {txs.map(tx => (
            <tr key={tx.id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-3 font-mono text-xs">{tx.order_id}</td>
              <td className="px-4 py-3">{new Date(tx.created_at).toLocaleString("id-ID")}</td>
              <td className="px-4 py-3">{fmt(tx.total_amount)}</td>
              <td className="px-4 py-3 text-amber-600">{fmt(tx.total_cost)}</td>
              <td className="px-4 py-3 text-green-600 font-semibold">{fmt(tx.total_profit)}</td>
              <td className="px-4 py-3 capitalize">{tx.payment_type ?? "-"}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs bg-${statusColor[tx.status] ?? "gray"}-100 text-${statusColor[tx.status] ?? "gray"}-700`}>
                  {tx.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### `Restock.jsx` — Log Harga Beli per Batch

```jsx
// Form: select item → input qty & cost_price (harga beli) → submit
export default function Restock() {
  const [items, setItems]   = useState([]);
  const [form, setForm]     = useState({ item_id: "", quantity: "", cost_price: "", note: "" });

  useEffect(() => {
    api.get("/api/items").then(res => setItems(res.data));
  }, []);

  const handleSubmit = async () => {
    await api.post("/api/restock", form);
    toast.success("Restock berhasil dicatat!");
    setForm({ item_id: "", quantity: "", cost_price: "", note: "" });
  };

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-2xl font-bold mb-4">Catat Restock</h1>
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <select value={form.item_id} onChange={e => setForm({...form, item_id: e.target.value})}>
          <option value="">Pilih Item</option>
          {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
        </select>
        <input type="number" placeholder="Jumlah (qty)" value={form.quantity}
               onChange={e => setForm({...form, quantity: e.target.value})} />
        <input type="number" placeholder="Harga Beli per Unit (IDR)" value={form.cost_price}
               onChange={e => setForm({...form, cost_price: e.target.value})} />
        <input type="text" placeholder="Catatan (opsional)" value={form.note}
               onChange={e => setForm({...form, note: e.target.value})} />
        <button onClick={handleSubmit}
                className="w-full bg-indigo-600 text-white py-2 rounded-xl font-semibold">
          Simpan Restock
        </button>
      </div>
    </div>
  );
}
```

---

## 9. Midtrans Integration

### Payment Flow

```
Frontend (React)           Backend (FastAPI)          Midtrans
     |                          |                         |
     |-- POST /transactions ---->|                         |
     |<-- { order_id } ----------|                         |
     |-- POST /payment/token --->|                         |
     |                          |--- create_transaction -->|
     |                          |<-- { token, url } -------|
     |<-- { snap_token } --------|                         |
     |-- window.snap.pay(token) -------[Snap Popup]------->|
     |                          |<-- POST /notification ---|  ← webhook
     |                          |-- update Supabase -------|
     |<-- onSuccess() -----------|                         |
```

### Webhook URL

Midtrans Dashboard → Settings → Configuration → Payment Notification URL:
```
https://yourdomain.com/api/payment/notification
```

For local dev:
```bash
ngrok http 8000
# Paste the HTTPS URL into Midtrans Dashboard
```

### Sandbox Test Credentials

| Method        | Test Info                                  |
|---------------|--------------------------------------------|
| Credit Card   | `4811 1111 1111 1114`, any future exp date |
| GoPay         | Use the QR mock shown in sandbox           |
| QRIS          | Use sandbox QR scanner                     |
| Bank Transfer | Any virtual account number works           |

---

## 10. API Endpoints Reference

### Restock
| Method | Endpoint                      | Description                              |
|--------|-------------------------------|------------------------------------------|
| POST   | `/api/restock`                | Log a new restock batch (harga beli)     |
| GET    | `/api/restock/{item_id}`      | Get all restock history for an item      |
| GET    | `/api/restock/{item_id}/latest-cost` | Get latest harga beli for an item |

### Items
| Method | Endpoint          | Description          |
|--------|-------------------|----------------------|
| GET    | `/api/items`      | Get all active items |
| POST   | `/api/items`      | Add new item         |
| PUT    | `/api/items/{id}` | Update item          |
| DELETE | `/api/items/{id}` | Soft delete item     |

### Transactions
| Method | Endpoint                 | Description                               |
|--------|--------------------------|-------------------------------------------|
| GET    | `/api/transactions`      | Get all transactions (includes profit)    |
| POST   | `/api/transactions`      | Create transaction (calculates profit)    |
| GET    | `/api/transactions/{id}` | Get single transaction detail with profit |

### Payment
| Method | Endpoint                    | Description                      |
|--------|-----------------------------|----------------------------------|
| POST   | `/api/payment/create-token` | Get Snap token for a transaction |
| POST   | `/api/payment/notification` | Midtrans webhook handler         |

### Dashboard
| Method | Endpoint               | Description                              |
|--------|------------------------|------------------------------------------|
| GET    | `/api/dashboard/today` | Today's revenue, cost, profit, top items |
| GET    | `/api/dashboard/chart` | Hourly/daily chart data                  |

---

## 11. Development Phases

### Phase 0 — IDE MCP Setup (Day 1)
- [ ] Add Supabase MCP config to `.cursor/mcp.json` or `.vscode/mcp.json`
- [ ] Add Google Stitch MCP config with correct local path
- [ ] Verify both MCPs respond in your IDE agent panel
- [ ] Create Supabase project, copy API keys

### Phase 1 — Database & Backend Foundation (Week 1)
- [ ] Use **Supabase MCP** to create all 4 tables: `items`, `transactions`, `transaction_items`, `restock_logs`
- [ ] Add indexes including `idx_restock_logs_item_id` for fast cost lookup
- [ ] Enable RLS and create `item-images` storage bucket via Supabase MCP
- [ ] Set up FastAPI with `supabase_client.py`
- [ ] Implement item CRUD with image upload to Supabase Storage
- [ ] Implement restock router (`POST /api/restock`, `GET /api/restock/{id}/latest-cost`)
- [ ] Write Pydantic schemas

### Phase 2 — Frontend Shell (Week 1)
- [ ] Bootstrap React + TailwindCSS
- [ ] Use **Google Stitch MCP** to design component layouts before coding
- [ ] Set up routing: `/`, `/pos`, `/items`, `/transactions`, `/restock`
- [ ] Connect axios and Supabase JS client

### Phase 3 — Core POS Features (Week 2)
- [ ] Item grid + cart logic (add, remove, update qty)
- [ ] Transaction creation flow
- [ ] Dashboard stats and bar chart

### Phase 4 — Midtrans Integration (Week 2)
- [ ] Build `/payment/create-token` endpoint
- [ ] Integrate Snap.js popup in React
- [ ] Implement webhook → update Supabase on payment status change
- [ ] Full sandbox test with ngrok

### Phase 5 — Polish & Deploy (Week 3)
- [ ] Item management UI with image preview
- [ ] Loading states, error handling, toast notifications
- [ ] Mobile-responsive layout
- [ ] Switch to Midtrans production keys
- [ ] Deploy backend (Railway / Render) + frontend (Vercel)
- [ ] Update Supabase CORS and RLS for production domain

---

## 12. Environment Configuration

### `backend/.env`
```env
SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGci...   # service_role key — backend only, never expose

MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxxxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxx
MIDTRANS_IS_PRODUCTION=False

ALLOWED_ORIGINS=http://localhost:3000
```

### `frontend/.env`
```env
REACT_APP_API_BASE_URL=http://localhost:8000

REACT_APP_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGci...   # anon key only — safe for frontend

REACT_APP_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxx
REACT_APP_MIDTRANS_SNAP_URL=https://app.sandbox.midtrans.com/snap/snap.js
```

> For production swap `REACT_APP_MIDTRANS_SNAP_URL` to:
> `https://app.midtrans.com/snap/snap.js`

---

## 13. Running the App

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Swagger docs: `http://localhost:8000/docs`

### Frontend
```bash
cd frontend
npm install
npm start
```

App: `http://localhost:3000`

---

## 🗒️ Notes & Tips

- **Never rely on frontend callbacks** to confirm payment — always update status via the Midtrans webhook at `/api/payment/notification`.
- **Use service_role key only on the backend.** Frontend must only ever use the anon key.
- **Deduct stock inside the webhook handler** after `status == "success"`, not at cart checkout time.
- **order_id must be unique** per Midtrans transaction — use `ORDER-{int(time.time())}` or a UUID.
- **Use Supabase MCP in your IDE** to inspect live data and run debug queries during development — faster than switching to the browser dashboard.
- **Use Google Stitch MCP before coding each page** — design the layout first, then implement. Saves major refactor time.
- For **receipt printing**, use `window.print()` with a print-only CSS class that hides nav and cart UI.

---

*Plan: Cashier App · ReactJS + FastAPI + Supabase + Midtrans · March 2026*
*IDE MCP Tools: Supabase MCP · Google Stitch MCP (both local — Cursor / VS Code)*