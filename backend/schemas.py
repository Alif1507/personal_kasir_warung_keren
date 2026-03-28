from pydantic import BaseModel, Field
from typing import Optional, List


class ItemCreate(BaseModel):
    name: str
    price: float = Field(..., ge=0)
    purchase_price: Optional[float] = Field(default=0.0, ge=0)
    stock: int = Field(..., ge=0)
    category: Optional[str] = None
    image_url: Optional[str] = None


class ItemUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = Field(default=None, ge=0)
    purchase_price: Optional[float] = Field(default=None, ge=0)
    stock: Optional[int] = Field(default=None, ge=0)
    category: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None


class CartItem(BaseModel):
    id: int
    name: str
    price: float
    purchase_price: Optional[float] = 0.0
    quantity: int = Field(..., gt=0)


class TransactionCreate(BaseModel):
    items: List[CartItem]
    total_amount: float


class PaymentTokenRequest(BaseModel):
    order_id: str
    item_details: List[dict]
