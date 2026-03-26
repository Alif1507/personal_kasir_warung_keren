from fastapi import APIRouter, HTTPException
from supabase_client import supabase
from schemas import TransactionCreate
import time

router = APIRouter()


@router.get("")
def get_transactions():
    result = (
        supabase.table("transactions")
        .select("*, transaction_items(*)")
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


@router.get("/{transaction_id}")
def get_transaction(transaction_id: int):
    result = (
        supabase.table("transactions")
        .select("*, transaction_items(*)")
        .eq("id", transaction_id)
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return result.data


@router.post("")
def create_transaction(payload: TransactionCreate):
    order_id = f"ORDER-{int(time.time())}"

    # Insert the transaction
    tx_result = (
        supabase.table("transactions")
        .insert({
            "order_id": order_id,
            "total_amount": payload.total_amount,
            "status": "pending",
        })
        .execute()
    )
    tx = tx_result.data[0]

    # Insert transaction items
    tx_items = []
    for item in payload.items:
        tx_items.append({
            "transaction_id": tx["id"],
            "item_id": item.id,
            "item_name": item.name,
            "quantity": item.quantity,
            "unit_price": item.price,
            "subtotal": item.price * item.quantity,
        })

    supabase.table("transaction_items").insert(tx_items).execute()

    return {"order_id": order_id, "transaction_id": tx["id"]}
