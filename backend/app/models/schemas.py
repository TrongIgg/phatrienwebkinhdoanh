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


class TrackingTimelineItem(BaseModel):
    stage: str = Field(min_length=1, max_length=80)
    label: str = Field(min_length=1, max_length=160)
    state: str = Field(min_length=1, max_length=40)


class TrackingCreateRequest(BaseModel):
    code: str = Field(min_length=3, max_length=80)
    tracking_type: str = Field(min_length=3, max_length=40)
    status: str = Field(min_length=2, max_length=80)
    title: str = Field(min_length=2, max_length=200)
    message: str = Field(min_length=2, max_length=1000)
    manager_name: str | None = Field(default=None, max_length=120)
    participant_count: int | None = Field(default=None, ge=0)
    checkin_status: str | None = Field(default=None, max_length=80)
    timeline: list[TrackingTimelineItem] = []


class TrackingBatchCreateRequest(BaseModel):
    records: list[TrackingCreateRequest] = Field(min_length=1, max_length=20)


class ReviewCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    title: str = Field(min_length=2, max_length=120)
    comment: str = Field(min_length=5, max_length=1000)
    rating: int = Field(ge=1, le=5)


class StaffBookingResponse(BaseModel):
    id: str
    customer: str
    phone: str
    email: str
    workshop: str
    product: str
    date: str
    time: str
    people: int
    price: str
    status: str
    payment: str
    staff: str
    note: str
    checkin_status: str = "pending"
    tracking_code: str | None = None
    workshop_id: int | None = None
    chatbot_note: str | None = None
    chatbot_style: str | None = None
    chatbot_experience: str | None = None
    chatbot_purpose: str | None = None
    chatbot_custom_request: str | None = None


class StaffTrackerResponse(BaseModel):
    id: str
    booking_id: str
    customer: str
    product: str
    workshop: str
    stage: str
    qc: str
    updated_at: str
    owner: str
    kiln: str
    tracking_code: str | None = None


class StaffProductJobResponse(BaseModel):
    id: str
    booking_id: str
    customer: str
    product: str
    stage: str
    status: str
    image: str
    owner: str
    due: str


class StaffDashboardResponse(BaseModel):
    today: int = 0
    week: int = 0
    customers: int = 0
    revenue_million: int = 0
    pending_checkin: int = 0
    checked_in: int = 0
    trackers_need_update: int = 0
    qc_issues: int = 0
    confirmed: int = 0
    paid: int = 0
    cancelled: int = 0


class StaffTrackerStageUpdate(BaseModel):
    stage: str = Field(min_length=3, max_length=40)
    qc: str | None = Field(default=None, max_length=40)


class ChatbotSessionUpsertRequest(BaseModel):
    session_id: str | None = Field(default=None, max_length=80)
    user_id: int | None = None
    style_preference: str | None = Field(default=None, max_length=80)
    experience_level: str | None = Field(default=None, max_length=80)
    purpose: str | None = Field(default=None, max_length=80)
    custom_request: str | None = Field(default=None, max_length=500)
    recommended_workshop_id: int | None = None
    behavior_tags: list[str] = []


class ChatbotSessionResponse(BaseModel):
    session_id: str
    user_id: int | None = None
    style_preference: str | None = None
    experience_level: str | None = None
    purpose: str | None = None
    custom_request: str | None = None
    recommended_workshop_id: int | None = None
    behavior_tags: list[str] = []
    created_at: str | None = None


class ChatbotRecommendationResponse(BaseModel):
    session_id: str
    recommended_workshop_id: int
    reason: str
    behavior_tags: list[str] = []
