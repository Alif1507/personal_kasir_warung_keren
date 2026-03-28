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
    if not payload.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    item_ids = list({item.id for item in payload.items})
    items_result = (
        supabase.table("items")
        .select("id, name, price, purchase_price, is_active")
        .in_("id", item_ids)
        .execute()
    )
    item_map = {item["id"]: item for item in items_result.data}

    missing_ids = [item_id for item_id in item_ids if item_id not in item_map]
    if missing_ids:
        raise HTTPException(status_code=404, detail=f"Items not found: {missing_ids}")

    total_amount = 0.0
    tx_items = []
    for cart_item in payload.items:
        if cart_item.quantity <= 0:
            raise HTTPException(status_code=400, detail="Item quantity must be greater than zero")

        db_item = item_map[cart_item.id]
        if db_item.get("is_active") is False:
            raise HTTPException(status_code=400, detail=f"Item is inactive: {db_item['name']}")

        unit_price = float(db_item.get("price") or 0)
        purchase_price = float(db_item.get("purchase_price") or 0)
        subtotal = unit_price * cart_item.quantity
        total_amount += subtotal

        tx_items.append({
            "item_id": db_item["id"],
            "item_name": db_item["name"],
            "quantity": cart_item.quantity,
            "unit_price": unit_price,
            "purchase_price": purchase_price,
            "subtotal": subtotal,
        })

    order_id = f"ORDER-{int(time.time())}"

    # Insert the transaction
    tx_result = (
        supabase.table("transactions")
        .insert({
            "order_id": order_id,
            "total_amount": total_amount,
            "status": "pending",
        })
        .execute()
    )
    tx = tx_result.data[0]

    # Insert transaction items with snapped prices from database
    for item in tx_items:
        item["transaction_id"] = tx["id"]

    supabase.table("transaction_items").insert(tx_items).execute()

    return {"order_id": order_id, "transaction_id": tx["id"]}
