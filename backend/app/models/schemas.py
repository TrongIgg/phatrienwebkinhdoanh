from pydantic import BaseModel, EmailStr, Field


class HealthResponse(BaseModel):
    status: str
    service: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ProductResponse(BaseModel):
    id: int
    sku: str
    name: str
    category: str
    collection: str = "Signature"
    price_vnd: int
    image_url: str | None = None
    stock_qty: int = 0
    rating: float = 5.0
    review_count: int = 0


class AddressCreateRequest(BaseModel):
    label: str = Field(default="Nha", max_length=50)
    recipient_name: str = Field(min_length=2, max_length=150)
    recipient_phone: str = Field(min_length=9, max_length=20)
    street: str = Field(min_length=3)
    district: str = Field(min_length=2, max_length=100)
    city: str = Field(min_length=2, max_length=100)
    is_default: bool = False


class AddressResponse(AddressCreateRequest):
    address_id: int
    user_id: int


class CartItemUpdateRequest(BaseModel):
    quantity: int = Field(ge=1, le=999)


class OrderCreateRequest(BaseModel):
    user_id: int = Field(gt=0)
    address_id: int = Field(gt=0)
    note: str | None = Field(default=None, max_length=500)


class SearchImageRequest(BaseModel):
    image_url: str = Field(min_length=10)


class SearchImageResponse(BaseModel):
    tags: list[str]
    matched_product_ids: list[int]


class WorkshopResponse(BaseModel):
    id: int
    name: str
    full_date: str
    start_date: str | None = None
    time: str
    instructor: str
    price_vnd: int
    package: str
    audience: str = "single_friendly"
    workshop_type: str = "basic"
    available_slots: int
    total_slots: int


class TrackingLookupResponse(BaseModel):
    code: str
    tracking_type: str
    status: str
    title: str
    message: str
    manager_name: str | None = None
    participant_count: int | None = None
    checkin_status: str | None = None
    timeline: list[dict] = []


class ReviewCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    title: str = Field(min_length=2, max_length=120)
    comment: str = Field(min_length=5, max_length=1000)
    rating: int = Field(ge=1, le=5)
