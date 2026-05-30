from fastapi import APIRouter, HTTPException

from app.models.schemas import CartItemUpdateRequest

router = APIRouter()
CART_STORE = {1: {"item_id": 1, "variant_id": 101, "quantity": 1}}


@router.put("/item/{item_id}")
def update_cart_item(item_id: int, payload: CartItemUpdateRequest) -> dict:
    if item_id not in CART_STORE:
        raise HTTPException(status_code=404, detail="Cart item not found")

    CART_STORE[item_id]["quantity"] = payload.quantity
    return {"message": "Cart item updated", "item": CART_STORE[item_id]}


@router.delete("/item/{item_id}")
def delete_cart_item(item_id: int) -> dict:
    if item_id not in CART_STORE:
        raise HTTPException(status_code=404, detail="Cart item not found")

    del CART_STORE[item_id]
    return {"message": "Cart item deleted"}
