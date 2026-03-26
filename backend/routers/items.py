from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from supabase_client import supabase
from schemas import ItemCreate, ItemUpdate
from typing import Optional

router = APIRouter()


@router.get("")
def get_items():
    result = supabase.table("items").select("*").eq("is_active", True).order("created_at", desc=True).execute()
    return result.data


@router.get("/{item_id}")
def get_item(item_id: int):
    result = supabase.table("items").select("*").eq("id", item_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Item not found")
    return result.data


@router.post("")
def create_item(item: ItemCreate):
    result = supabase.table("items").insert(item.model_dump()).execute()
    return result.data[0]


@router.put("/{item_id}")
def update_item(item_id: int, item: ItemUpdate):
    update_data = {k: v for k, v in item.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
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
