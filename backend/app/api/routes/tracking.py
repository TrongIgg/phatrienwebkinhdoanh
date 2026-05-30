from fastapi import APIRouter, HTTPException

from app.models.schemas import TrackingLookupResponse
from app.db.database import db_client

router = APIRouter()

TRACKING_STORE = {
    "THO-2024-0847": {
        "code": "THO-2024-0847",
        "tracking_type": "ceramic",
        "status": "bisque_firing",
        "title": "Ly gom cua Minh Anh",
        "message": "San pham dang o giai doan nung so.",
        "timeline": [
            {"stage": "forming", "label": "Da tao hinh", "state": "done"},
            {"stage": "drying", "label": "Phoi kho", "state": "done"},
            {"stage": "bisque_firing", "label": "Nung so", "state": "current"},
            {"stage": "glazing", "label": "Trang men", "state": "waiting"},
        ],
    },
    "WS052826": {
        "code": "WS052826",
        "tracking_type": "workshop",
        "status": "confirmed",
        "title": "Ve workshop Nan gom co ban",
        "message": "Ve da xac nhan. QR check-in gui qua email/SMS.",
        "timeline": [],
    },
    "ORD28052026": {
        "code": "ORD28052026",
        "tracking_type": "order",
        "status": "paid",
        "title": "Don hang THO Studio",
        "message": "Don hang da thanh toan va dang cho dong goi.",
        "timeline": [],
    },
}


@router.get("/{code}", response_model=TrackingLookupResponse)
def lookup_tracking(code: str) -> TrackingLookupResponse:
    normalized = code.strip().upper()
    row = db_client.fetch_one(
        """
        SELECT code, tracking_type, status, title, message, manager_name, participant_count, checkin_status
        FROM tracking_records
        WHERE code = ?
        """,
        (normalized,),
    )
    if row:
        timeline = db_client.fetch_all(
            """
            SELECT stage, label, state
            FROM tracking_timeline
            WHERE tracking_code = ?
            ORDER BY position ASC, id ASC
            """,
            (normalized,),
        )
        return TrackingLookupResponse(**{**row, "timeline": timeline})

    if normalized not in TRACKING_STORE:
        raise HTTPException(status_code=404, detail="Tracking code not found")
    return TrackingLookupResponse(**TRACKING_STORE[normalized])
