from fastapi import APIRouter

from app.api.routes import addresses, auth, cart, chatbot, health, orders, products, reviews, search, staff, tracking, workshops

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(workshops.router, prefix="/workshops", tags=["workshops"])
api_router.include_router(addresses.router, prefix="/user/addresses", tags=["addresses"])
api_router.include_router(cart.router, prefix="/cart", tags=["cart"])
api_router.include_router(chatbot.router, prefix="/chatbot", tags=["chatbot"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(search.router, prefix="/search", tags=["search"])
api_router.include_router(tracking.router, prefix="/tracking", tags=["tracking"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
api_router.include_router(staff.router, prefix="/staff", tags=["staff"])
