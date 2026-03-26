import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from routers import items, transactions, dashboard, payment

app = FastAPI(title="Cashier App API", redirect_slashes=False)

origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(items.router, prefix="/api/items", tags=["Items"])
app.include_router(transactions.router, prefix="/api/transactions", tags=["Transactions"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(payment.router, prefix="/api/payment", tags=["Payment"])


@app.get("/")
def root():
    return {"message": "Cashier App API is running 🧾"}
