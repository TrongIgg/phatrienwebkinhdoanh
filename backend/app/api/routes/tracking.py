from fastapi import APIRouter, HTTPException, status

from app.models.schemas import TrackingBatchCreateRequest, TrackingLookupResponse
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


@router.post("", response_model=list[TrackingLookupResponse], status_code=status.HTTP_201_CREATED)
def create_tracking_records(payload: TrackingBatchCreateRequest) -> list[TrackingLookupResponse]:
    created_records: list[TrackingLookupResponse] = []

    for record in payload.records:
        normalized = record.code.strip().upper()
        db_client.execute(
            """
            INSERT INTO tracking_records
                (code, tracking_type, status, title, message, manager_name, participant_count, checkin_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(code) DO UPDATE SET
                tracking_type = excluded.tracking_type,
                status = excluded.status,
                title = excluded.title,
                message = excluded.message,
                manager_name = excluded.manager_name,
                participant_count = excluded.participant_count,
                checkin_status = excluded.checkin_status
            """,
            (
                normalized,
                record.tracking_type,
                record.status,
                record.title,
                record.message,
                record.manager_name,
                record.participant_count,
                record.checkin_status,
            ),
        )
        db_client.execute("DELETE FROM tracking_timeline WHERE tracking_code = ?", (normalized,))
        for index, step in enumerate(record.timeline, start=1):
            db_client.execute(
                """
                INSERT INTO tracking_timeline (tracking_code, stage, label, state, position)
                VALUES (?, ?, ?, ?, ?)
                """,
                (normalized, step.stage, step.label, step.state, index),
            )
        created_records.append(TrackingLookupResponse(**{**record.model_dump(), "code": normalized}))

    return created_records


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
