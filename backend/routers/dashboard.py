from fastapi import APIRouter
from supabase_client import supabase
from datetime import date, timedelta

router = APIRouter()


@router.get("/today")
def get_today_stats():
    today = date.today().isoformat()
    result = (
        supabase.table("transactions")
        .select("id, total_amount, created_at, transaction_items(item_name, quantity)")
        .eq("status", "success")
        .gte("created_at", f"{today}T00:00:00")
        .lte("created_at", f"{today}T23:59:59")
        .execute()
    )

    txs = result.data
    item_counts = {}
    for t in txs:
        for item in t.get("transaction_items", []):
            n = item["item_name"]
            item_counts[n] = item_counts.get(n, 0) + item["quantity"]

    top = sorted(item_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    return {
        "total_revenue": sum(float(t["total_amount"]) for t in txs),
        "total_orders": len(txs),
        "top_items": [{"name": k, "qty": v} for k, v in top],
    }


@router.get("/chart")
def get_chart_data():
    """Get sales data for the last 7 days for charting."""
    today = date.today()
    seven_days_ago = today - timedelta(days=6)

    result = (
        supabase.table("transactions")
        .select("total_amount, created_at")
        .eq("status", "success")
        .gte("created_at", f"{seven_days_ago.isoformat()}T00:00:00")
        .lte("created_at", f"{today.isoformat()}T23:59:59")
        .execute()
    )

    # Group by date
    daily = {}
    for d in range(7):
        day = (seven_days_ago + timedelta(days=d)).isoformat()
        daily[day] = 0

    for tx in result.data:
        day = tx["created_at"][:10]
        if day in daily:
            daily[day] += float(tx["total_amount"])

    return [{"date": k, "revenue": v} for k, v in daily.items()]
