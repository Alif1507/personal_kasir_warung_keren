from pydantic import BaseModel
from typing import Optional, List


class ItemCreate(BaseModel):
    name: str
    price: float
    stock: int
    category: Optional[str] = None
    image_url: Optional[str] = None


class ItemUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None


class CartItem(BaseModel):
    id: int
    name: str
    price: float
    quantity: int


class TransactionCreate(BaseModel):
    items: List[CartItem]
    total_amount: float


class PaymentTokenRequest(BaseModel):
    order_id: str
    item_details: List[dict]
