from fastapi import APIRouter

from app.models.schemas import OrderCreateRequest

router = APIRouter()
ORDER_STORE: list[dict] = []


@router.post("", status_code=201)
def create_order(payload: OrderCreateRequest) -> dict:
    order = {
        "order_id": len(ORDER_STORE) + 1,
        "order_code": f"THO-{len(ORDER_STORE) + 1:05d}",
        "user_id": payload.user_id,
        "address_id": payload.address_id,
        "status": "pending",
    }
    ORDER_STORE.append(order)
    return order


@router.get("/{order_id}")
def get_order(order_id: int) -> dict:
    for order in ORDER_STORE:
        if order["order_id"] == order_id:
            return order
    return {"message": "Order not found"}
