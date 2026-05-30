from fastapi import APIRouter, HTTPException

from app.models.schemas import ProductResponse
from app.db.database import db_client

router = APIRouter()

DEMO_PRODUCTS = [
    {
        "id": 1,
        "sku": "THO-CELADON-S",
        "name": "Binh gom men celadon",
        "category": "decor",
        "collection": "Men xanh nhe",
        "price_vnd": 380000,
        "image_url": None,
        "stock_qty": 8,
        "rating": 4.8,
        "review_count": 24,
    },
    {
        "id": 2,
        "sku": "THO-DIY-KIT",
        "name": "Bo DIY Kit to mau men",
        "category": "kit",
        "collection": "Tu tay lam gom",
        "price_vnd": 220000,
        "image_url": None,
        "stock_qty": 24,
        "rating": 4.7,
        "review_count": 18,
    },
]


@router.get("", response_model=list[ProductResponse])
def list_products() -> list[ProductResponse]:
    rows = db_client.fetch_all(
        """
        SELECT id, sku, name, category, collection, price_vnd, image_url, stock_qty, rating, review_count
        FROM products
        WHERE is_active = 1
        ORDER BY stock_qty = 0 ASC, collection ASC, id ASC
        """
    )
    if not rows:
        rows = DEMO_PRODUCTS
    return [ProductResponse(**row) for row in rows]


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int) -> ProductResponse:
    row = db_client.fetch_one(
        """
        SELECT id, sku, name, category, collection, price_vnd, image_url, stock_qty, rating, review_count
        FROM products
        WHERE id = ? AND is_active = 1
        """,
        (product_id,),
    )
    if row:
        return ProductResponse(**row)

    for product in DEMO_PRODUCTS:
        if product["id"] == product_id:
            return ProductResponse(**product)

    raise HTTPException(status_code=404, detail="Product not found")
