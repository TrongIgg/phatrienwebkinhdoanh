from datetime import datetime

from fastapi import APIRouter, HTTPException, status

from app.db.database import db_client
from app.models.schemas import (
    ChatbotSessionResponse,
    StaffBookingResponse,
    StaffDashboardResponse,
    StaffProductJobResponse,
    StaffTrackerResponse,
    StaffTrackerStageUpdate,
)

router = APIRouter()

STAFF_STAGES = ["created", "drying", "bisque", "glazing", "final", "ready", "done"]

CUSTOMER_STAGE_MAP: dict[str, tuple[str, str, str]] = {
    "created": ("forming", "Da tao hinh", "forming"),
    "drying": ("drying", "Phoi kho", "drying"),
    "bisque": ("bisque_firing", "Nung so", "bisque_firing"),
    "glazing": ("glazing", "Trang men", "glazing"),
    "final": ("final_firing", "Nung hoan thien", "final_firing"),
    "ready": ("ready", "San sang nhan", "ready"),
    "done": ("done", "Hoan tat", "done"),
}

CHATBOT_LABELS = {
    "minimal": "Toi gian",
    "colorful": "Mau sac noi bat",
    "natural": "Tu nhien tho moc",
    "unknown": "Chua ro phong cach",
    "first_time": "Lan dau",
    "some": "Da thu 1-2 lan",
    "experienced": "Co kinh nghiem",
    "self": "Cho ban than",
    "gift": "Lam qua tang",
    "home": "Trang tri nha",
    "relax": "Thu gian",
}


def _format_vnd(amount: int) -> str:
    return f"{amount:,}".replace(",", ".") + "đ"


def _chatbot_note(row: dict) -> str | None:
    if not row.get("chatbot_session_id"):
        return None

    style = CHATBOT_LABELS.get(row.get("chatbot_style"), row.get("chatbot_style") or "Chua ro")
    level = CHATBOT_LABELS.get(row.get("chatbot_experience"), row.get("chatbot_experience") or "Chua ro")
    purpose = CHATBOT_LABELS.get(row.get("chatbot_purpose"), row.get("chatbot_purpose") or "Chua ro")
    custom = row.get("chatbot_custom_request") or "Khach chua nhap san pham cu the"
    return f"Phong cach: {style}; Level: {level}; Muc dich: {purpose}; Mong muon: {custom}"


def _row_booking(row: dict) -> StaffBookingResponse:
    return StaffBookingResponse(
        id=row["booking_code"],
        customer=row["customer_name"],
        phone=row["phone"],
        email=row["email"],
        workshop=row.get("workshop_name") or "",
        product=row["product_name"],
        date=row["booking_date"],
        time=row["booking_time"],
        people=row["people_count"],
        price=_format_vnd(int(row["price_vnd"])),
        status=row["status"],
        payment=row["payment_status"],
        staff=row["staff_name"],
        note=row["note"],
        checkin_status=row["checkin_status"],
        tracking_code=row.get("tracking_code"),
        workshop_id=row.get("workshop_id"),
        chatbot_note=_chatbot_note(row),
        chatbot_style=row.get("chatbot_style"),
        chatbot_experience=row.get("chatbot_experience"),
        chatbot_purpose=row.get("chatbot_purpose"),
        chatbot_custom_request=row.get("chatbot_custom_request"),
    )


def _row_tracker(row: dict) -> StaffTrackerResponse:
    return StaffTrackerResponse(
        id=row["tracker_id"],
        booking_id=row["booking_code"],
        customer=row["customer_name"],
        product=row["product_name"],
        workshop=row["workshop_name"],
        stage=row["stage"],
        qc=row["qc_status"],
        updated_at=row["updated_at"],
        owner=row["owner_name"],
        kiln=row["kiln_batch"],
        tracking_code=row.get("tracking_code"),
    )


def _row_product_job(row: dict) -> StaffProductJobResponse:
    return StaffProductJobResponse(
        id=row["job_id"],
        booking_id=row["booking_code"],
        customer=row["customer_name"],
        product=row["product_name"],
        stage=row["stage"],
        status=row["job_status"],
        image=row["image_note"],
        owner=row["owner_name"],
        due=row["due_date"],
    )


def _sync_customer_tracking(tracking_code: str, stage: str) -> None:
    mapped = CUSTOMER_STAGE_MAP.get(stage)
    if not mapped:
        return

    status_slug, status_label, _ = mapped
    stage_index = STAFF_STAGES.index(stage) if stage in STAFF_STAGES else 0

    db_client.execute(
        """
        UPDATE tracking_records
        SET status = ?, message = ?
        WHERE code = ?
        """,
        (status_slug, f"San pham dang o giai doan {status_label.lower()}.", tracking_code),
    )
    db_client.execute("DELETE FROM tracking_timeline WHERE tracking_code = ?", (tracking_code,))

    for index, staff_stage in enumerate(STAFF_STAGES[:7]):
        customer = CUSTOMER_STAGE_MAP.get(staff_stage)
        if not customer:
            continue
        slug, label, _ = customer
        if index < stage_index:
            state = "done"
        elif index == stage_index:
            state = "current"
        else:
            state = "waiting"
        db_client.execute(
            """
            INSERT INTO tracking_timeline (tracking_code, stage, label, state, position)
            VALUES (?, ?, ?, ?, ?)
            """,
            (tracking_code, slug, label, state, index + 1),
        )


@router.get("/dashboard", response_model=StaffDashboardResponse)
def staff_dashboard() -> StaffDashboardResponse:
    bookings = db_client.fetch_all(
        """
        SELECT status, payment_status, checkin_status, price_vnd, booking_date
        FROM workshop_bookings
        """
    )
    trackers = db_client.fetch_all("SELECT stage, qc_status FROM ceramic_trackers")

    today = datetime.now().strftime("%d/%m/%Y")
    today_bookings = sum(1 for row in bookings if row.get("booking_date") == today)

    return StaffDashboardResponse(
        today=max(today_bookings, sum(1 for row in bookings if row["status"] == "pending")),
        week=len(bookings),
        customers=len({row.get("customer_name") for row in db_client.fetch_all("SELECT customer_name FROM workshop_bookings")}),
        revenue_million=max(1, sum(int(row["price_vnd"]) for row in bookings if row["status"] != "cancelled") // 1_000_000),
        pending_checkin=sum(1 for row in bookings if row["checkin_status"] == "pending" and row["status"] != "cancelled"),
        checked_in=sum(1 for row in bookings if row["checkin_status"] == "checked_in"),
        trackers_need_update=sum(1 for row in trackers if row["stage"] not in ("ready", "done")),
        qc_issues=sum(1 for row in trackers if row["qc_status"] not in ("normal",)),
        confirmed=sum(1 for row in bookings if row["status"] == "confirmed"),
        paid=sum(1 for row in bookings if row["payment_status"] == "paid"),
        cancelled=sum(1 for row in bookings if row["status"] == "cancelled"),
    )


@router.get("/bookings", response_model=list[StaffBookingResponse])
def list_bookings() -> list[StaffBookingResponse]:
    rows = db_client.fetch_all(
        """
        SELECT b.*, w.name AS workshop_name,
               l.session_id AS chatbot_session_id,
               cs.style_preference AS chatbot_style,
               cs.experience_level AS chatbot_experience,
               cs.purpose AS chatbot_purpose,
               cs.custom_request AS chatbot_custom_request
        FROM workshop_bookings b
        LEFT JOIN workshops w ON w.id = b.workshop_id
        LEFT JOIN booking_chatbot_links l ON l.booking_code = b.booking_code
        LEFT JOIN chatbot_sessions cs ON cs.session_id = l.session_id
        ORDER BY b.booking_date DESC, b.booking_time DESC
        """
    )
    return [_row_booking(row) for row in rows]


@router.get("/chatbot-notes/{booking_id}", response_model=ChatbotSessionResponse | None)
def chatbot_notes(booking_id: str) -> ChatbotSessionResponse | None:
    row = db_client.fetch_one(
        """
        SELECT cs.*
        FROM booking_chatbot_links l
        JOIN chatbot_sessions cs ON cs.session_id = l.session_id
        WHERE UPPER(l.booking_code) = ?
        """,
        (booking_id.strip().upper(),),
    )
    if not row:
        return None

    raw_tags = row.get("behavior_tags") or "[]"
    tags = [tag for tag in raw_tags.replace("[", "").replace("]", "").replace('"', "").split(",") if tag.strip()]
    return ChatbotSessionResponse(
        session_id=row["session_id"],
        user_id=row.get("user_id"),
        style_preference=row.get("style_preference"),
        experience_level=row.get("experience_level"),
        purpose=row.get("purpose"),
        custom_request=row.get("custom_request"),
        recommended_workshop_id=row.get("recommended_workshop_id"),
        behavior_tags=[tag.strip() for tag in tags],
        created_at=row.get("created_at"),
    )


@router.get("/trackers", response_model=list[StaffTrackerResponse])
def list_trackers() -> list[StaffTrackerResponse]:
    rows = db_client.fetch_all(
        """
        SELECT tracker_id, booking_code, tracking_code, customer_name, product_name,
               workshop_name, stage, qc_status, updated_at, owner_name, kiln_batch
        FROM ceramic_trackers
        ORDER BY updated_at DESC
        """
    )
    return [_row_tracker(row) for row in rows]


@router.get("/product-jobs", response_model=list[StaffProductJobResponse])
def list_product_jobs() -> list[StaffProductJobResponse]:
    rows = db_client.fetch_all(
        """
        SELECT job_id, booking_code, customer_name, product_name, stage,
               job_status, image_note, owner_name, due_date
        FROM ceramic_product_jobs
        ORDER BY due_date ASC
        """
    )
    return [_row_product_job(row) for row in rows]


@router.patch("/trackers/{tracker_id}", response_model=StaffTrackerResponse)
def update_tracker_stage(tracker_id: str, payload: StaffTrackerStageUpdate) -> StaffTrackerResponse:
    stage = payload.stage.strip().lower()
    if stage not in STAFF_STAGES:
        raise HTTPException(status_code=400, detail="Invalid tracker stage")

    normalized_id = tracker_id.strip().upper()
    row = db_client.fetch_one(
        "SELECT * FROM ceramic_trackers WHERE UPPER(tracker_id) = ?",
        (normalized_id,),
    )
    if not row:
        raise HTTPException(status_code=404, detail="Tracker not found")

    updated_at = datetime.now().strftime("%d/%m/%Y %H:%M")
    db_client.execute(
        """
        UPDATE ceramic_trackers
        SET stage = ?, qc_status = COALESCE(?, qc_status), updated_at = ?
        WHERE UPPER(tracker_id) = ?
        """,
        (stage, payload.qc, updated_at, normalized_id),
    )

    if row.get("tracking_code"):
        _sync_customer_tracking(row["tracking_code"], stage)

    db_client.execute(
        "UPDATE ceramic_product_jobs SET stage = ? WHERE booking_code = ?",
        (stage, row["booking_code"]),
    )

    refreshed = db_client.fetch_one("SELECT * FROM ceramic_trackers WHERE UPPER(tracker_id) = ?", (normalized_id,))
    return _row_tracker(refreshed or row)
