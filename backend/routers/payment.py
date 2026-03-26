from fastapi import APIRouter, Request
from supabase_client import supabase
from services.midtrans import snap, create_snap_token
from schemas import PaymentTokenRequest

router = APIRouter()


@router.post("/create-token")
def create_payment_token(payload: PaymentTokenRequest):
    tx = (
        supabase.table("transactions")
        .select("*")
        .eq("order_id", payload.order_id)
        .single()
        .execute()
        .data
    )

    token, redirect_url = create_snap_token(
        order_id=payload.order_id,
        gross_amount=int(tx["total_amount"]),
        customer_details={"first_name": "Customer"},
        item_details=payload.item_details,
    )

    supabase.table("transactions").update({"snap_token": token}).eq(
        "order_id", payload.order_id
    ).execute()

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

    supabase.table("transactions").update(
        {"status": status, "payment_type": res.get("payment_type", "")}
    ).eq("order_id", order_id).execute()

    # Stock deduction on success
    if status == "success":
        tx_items = (
            supabase.table("transaction_items")
            .select("item_id, quantity")
            .eq(
                "transaction_id",
                supabase.table("transactions")
                .select("id")
                .eq("order_id", order_id)
                .single()
                .execute()
                .data["id"],
            )
            .execute()
            .data
        )
        for ti in tx_items:
            item = (
                supabase.table("items")
                .select("stock")
                .eq("id", ti["item_id"])
                .single()
                .execute()
                .data
            )
            new_stock = max(0, item["stock"] - ti["quantity"])
            supabase.table("items").update({"stock": new_stock}).eq(
                "id", ti["item_id"]
            ).execute()

    return {"message": "OK"}


@router.post("/success/{order_id}")
def payment_success_manual(order_id: str, payment_type: str = "Midtrans"):
    """
    Fallback endpoint for local development since Midtrans webhooks cannot reach localhost.
    Called by the frontend's onSuccess callback.
    """
    # Check if already paid to prevent double stock deduction
    tx = supabase.table("transactions").select("status").eq("order_id", order_id).single().execute().data
    if tx and tx["status"] == "success":
        return {"message": "Already paid"}

    # Update transaction status
    supabase.table("transactions").update({"status": "success", "payment_type": payment_type}).eq("order_id", order_id).execute()

    # Deduct stock
    ts_response = supabase.table("transactions").select("id").eq("order_id", order_id).single().execute()
    if ts_response.data:
        tx_id = ts_response.data["id"]
        tx_items = supabase.table("transaction_items").select("item_id, quantity").eq("transaction_id", tx_id).execute().data
        for ti in tx_items:
            item = supabase.table("items").select("stock").eq("id", ti["item_id"]).single().execute().data
            new_stock = max(0, item["stock"] - ti["quantity"])
            supabase.table("items").update({"stock": new_stock}).eq("id", ti["item_id"]).execute()

    return {"message": "Payment confirmed"}
