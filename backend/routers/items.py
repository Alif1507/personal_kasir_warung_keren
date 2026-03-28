import csv
import io
import re

from fastapi import APIRouter, UploadFile, File, HTTPException
from supabase_client import supabase
from schemas import ItemCreate, ItemUpdate

router = APIRouter()


def _normalize_name(value: str) -> str:
    return " ".join(str(value).strip().lower().split())


def _normalize_header(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", str(value).strip().lower())


def _parse_number(raw_value: str) -> float:
    value = str(raw_value or "").strip()
    if not value:
        raise ValueError("Nilai angka wajib diisi")

    value = (
        value.replace("Rp", "")
        .replace("rp", "")
        .replace("IDR", "")
        .replace("idr", "")
    )
    value = re.sub(r"[^\d,.\-]", "", value)

    if not value or value == "-":
        raise ValueError("Format angka tidak valid")
    if value.count("-") > 1 or ("-" in value and not value.startswith("-")):
        raise ValueError("Format angka tidak valid")

    if "." in value and "," in value:
        if value.rfind(",") > value.rfind("."):
            value = value.replace(".", "").replace(",", ".")
        else:
            value = value.replace(",", "")
    elif "," in value:
        if value.count(",") == 1 and len(value.split(",")[1]) <= 2:
            value = value.replace(",", ".")
        else:
            value = value.replace(",", "")
    elif "." in value:
        if not (value.count(".") == 1 and len(value.split(".")[1]) <= 2):
            value = value.replace(".", "")

    try:
        return float(value)
    except ValueError as exc:
        raise ValueError("Format angka tidak valid") from exc


def _parse_stock(raw_value: str) -> int:
    stock = _parse_number(raw_value)
    if stock < 0:
        raise ValueError("QTY harus >= 0")
    if not stock.is_integer():
        raise ValueError("QTY harus bilangan bulat")
    return int(stock)


def _detect_delimiter(text: str) -> str:
    sample = text[:2048]
    try:
        sniffed = csv.Sniffer().sniff(sample, delimiters=";,")
        return sniffed.delimiter
    except csv.Error:
        return ";" if sample.count(";") >= sample.count(",") else ","


def _resolve_column_indexes(headers):
    header_index = {_normalize_header(value): idx for idx, value in enumerate(headers)}
    aliases = {
        "name": ["item", "name", "nama"],
        "price": ["hargajual", "sellprice", "price"],
        "purchase_price": ["hargabeli", "purchaseprice", "buyprice", "modal"],
        "stock": ["qty", "stock", "stok", "quantity"],
    }

    indexes = {}
    missing = []
    for target, candidates in aliases.items():
        match = next((alias for alias in candidates if alias in header_index), None)
        if match is None:
            missing.append(target)
        else:
            indexes[target] = header_index[match]
    return indexes, missing


@router.get("")
def get_items():
    result = supabase.table("items").select("*").eq("is_active", True).order("created_at", desc=True).execute()
    return result.data


@router.post("/import-csv")
async def import_items_csv(file: UploadFile = File(...)):
    filename = (file.filename or "").lower()
    if not filename.endswith(".csv") and "csv" not in (file.content_type or "").lower():
        raise HTTPException(status_code=400, detail="File harus berformat CSV")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="File CSV kosong")

    try:
        text = content.decode("utf-8-sig")
    except UnicodeDecodeError as exc:
        raise HTTPException(
            status_code=400,
            detail="CSV harus menggunakan encoding UTF-8",
        ) from exc

    delimiter = _detect_delimiter(text)
    rows = list(csv.reader(io.StringIO(text), delimiter=delimiter))
    non_empty_rows = [row for row in rows if any(str(cell).strip() for cell in row)]
    if len(non_empty_rows) < 2:
        raise HTTPException(status_code=400, detail="CSV tidak memiliki baris data")

    headers = [str(cell).strip() for cell in non_empty_rows[0]]
    col_idx, missing_cols = _resolve_column_indexes(headers)
    if missing_cols:
        human_names = {
            "name": "Item",
            "price": "Harga Jual",
            "purchase_price": "Harga Beli",
            "stock": "QTY",
        }
        missing = ", ".join(human_names[c] for c in missing_cols)
        raise HTTPException(status_code=400, detail=f"Kolom wajib tidak ditemukan: {missing}")

    existing = supabase.table("items").select("id, name").execute().data or []
    existing_by_name = {}
    for item in existing:
        normalized = _normalize_name(item.get("name", ""))
        if normalized and normalized not in existing_by_name:
            existing_by_name[normalized] = item

    created_count = 0
    updated_count = 0
    failed_count = 0
    processed_rows = 0
    errors = []

    data_rows = non_empty_rows[1:]
    for row_number, row in enumerate(data_rows, start=1):
        item_name = "-"
        try:
            def pick(column_key: str) -> str:
                idx = col_idx[column_key]
                if idx >= len(row):
                    return ""
                return str(row[idx]).strip()

            item_name = pick("name")
            if not item_name:
                raise ValueError("Nama item wajib diisi")

            sell_price = _parse_number(pick("price"))
            buy_price = _parse_number(pick("purchase_price"))
            stock = _parse_stock(pick("stock"))

            if sell_price < 0 or buy_price < 0:
                raise ValueError("Harga harus >= 0")
            if sell_price < buy_price:
                raise ValueError("Harga jual tidak boleh lebih kecil dari harga beli")

            payload = {
                "name": item_name.strip(),
                "price": sell_price,
                "purchase_price": buy_price,
                "stock": stock,
                "is_active": True,
            }

            normalized_name = _normalize_name(item_name)
            existing_item = existing_by_name.get(normalized_name)

            if existing_item:
                (
                    supabase.table("items")
                    .update(payload)
                    .eq("id", existing_item["id"])
                    .execute()
                )
                updated_count += 1
            else:
                inserted = supabase.table("items").insert(payload).execute().data or []
                created_count += 1
                if inserted and inserted[0].get("id"):
                    existing_by_name[normalized_name] = {
                        "id": inserted[0]["id"],
                        "name": payload["name"],
                    }

            processed_rows += 1
        except ValueError as exc:
            failed_count += 1
            errors.append({"row": row_number, "item": item_name, "reason": str(exc)})
        except Exception:
            failed_count += 1
            errors.append(
                {
                    "row": row_number,
                    "item": item_name,
                    "reason": "Gagal menyimpan baris ke database",
                }
            )

    return {
        "total_rows": len(data_rows),
        "processed_rows": processed_rows,
        "created_count": created_count,
        "updated_count": updated_count,
        "failed_count": failed_count,
        "errors": errors,
    }


@router.get("/{item_id}")
def get_item(item_id: int):
    result = supabase.table("items").select("*").eq("id", item_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Item not found")
    return result.data


@router.post("")
def create_item(item: ItemCreate):
    if float(item.price) < float(item.purchase_price or 0):
        raise HTTPException(
            status_code=400,
            detail="Harga jual tidak boleh lebih kecil dari harga beli",
        )

    result = supabase.table("items").insert(item.model_dump()).execute()
    return result.data[0]


@router.put("/{item_id}")
def update_item(item_id: int, item: ItemUpdate):
    update_data = {k: v for k, v in item.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    existing = (
        supabase.table("items")
        .select("price, purchase_price")
        .eq("id", item_id)
        .single()
        .execute()
        .data
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Item not found")

    final_price = float(update_data.get("price", existing.get("price") or 0))
    final_purchase_price = float(
        update_data.get("purchase_price", existing.get("purchase_price") or 0)
    )
    if final_price < final_purchase_price:
        raise HTTPException(
            status_code=400,
            detail="Harga jual tidak boleh lebih kecil dari harga beli",
        )

    result = supabase.table("items").update(update_data).eq("id", item_id).execute()
    return result.data[0]


@router.delete("/{item_id}")
def delete_item(item_id: int):
    """Soft delete — sets is_active to False."""
    result = supabase.table("items").update({"is_active": False}).eq("id", item_id).execute()
    return {"message": "Item deleted", "data": result.data}


@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    """Upload an image to Supabase Storage and return the public URL."""
    import time
    filename = f"{int(time.time())}-{file.filename}"
    content = await file.read()

    supabase.storage.from_("item-images").upload(
        path=filename,
        file=content,
        file_options={"content-type": file.content_type},
    )

    url = supabase.storage.from_("item-images").get_public_url(filename)
    return {"image_url": url}
