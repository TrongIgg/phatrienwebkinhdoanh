from fastapi import APIRouter, HTTPException, Query

from app.models.schemas import WorkshopResponse
from app.db.database import db_client

router = APIRouter()

WORKSHOPS = [
    {
        "id": 1,
        "name": "Nan gom co ban",
        "full_date": "Thu Bay, 31/05/2026",
        "start_date": "2026-05-31",
        "time": "09:00 - 11:30",
        "instructor": "Nghe nhan Minh Chau",
        "price_vnd": 490000,
        "package": "1 nguoi",
        "audience": "single_friendly",
        "workshop_type": "basic",
        "available_slots": 8,
        "total_slots": 12,
    },
    {
        "id": 2,
        "name": "Trang tri gom co ban",
        "full_date": "Chu Nhat, 01/06/2026",
        "start_date": "2026-06-01",
        "time": "14:00 - 16:30",
        "instructor": "Nghe nhan Hoai An",
        "price_vnd": 380000,
        "package": "1 nguoi",
        "audience": "single_friendly",
        "workshop_type": "painting",
        "available_slots": 4,
        "total_slots": 10,
    },
    {
        "id": 3,
        "name": "Combo co doi co cap",
        "full_date": "Thu Bay, 07/06/2026",
        "start_date": "2026-06-07",
        "time": "09:00 - 12:00",
        "instructor": "Nghe nhan Minh Chau",
        "price_vnd": 600000,
        "package": "2 nguoi",
        "audience": "couple_friendly",
        "workshop_type": "combo",
        "available_slots": 6,
        "total_slots": 10,
    },
]


@router.get("", response_model=list[WorkshopResponse])
def list_workshops(
    audience: str | None = None,
    workshop_type: str | None = None,
    date_range: str | None = Query(default=None, pattern="^(week|month)$"),
    min_price: int | None = None,
    max_price: int | None = None,
) -> list[WorkshopResponse]:
    clauses = ["status = 'available'"]
    params: list[object] = []
    if audience and audience != "all":
        clauses.append("audience = ?")
        params.append(audience)
    if workshop_type and workshop_type != "all":
        clauses.append("workshop_type = ?")
        params.append(workshop_type)
    if date_range == "week":
        clauses.append("date(start_date) <= date('now', '+7 day')")
    elif date_range == "month":
        clauses.append("date(start_date) <= date('now', '+1 month')")
    if min_price is not None:
        clauses.append("price_vnd >= ?")
        params.append(min_price)
    if max_price is not None:
        clauses.append("price_vnd <= ?")
        params.append(max_price)

    rows = db_client.fetch_all(
        f"""
        SELECT id, name, full_date, start_date, time, instructor, price_vnd, package,
               audience, workshop_type, available_slots, total_slots
        FROM workshops
        WHERE {" AND ".join(clauses)}
        ORDER BY start_date ASC, id ASC
        """,
        tuple(params),
    )
    if rows:
        return [WorkshopResponse(**row) for row in rows]
    return [WorkshopResponse(**row) for row in WORKSHOPS]


@router.get("/{workshop_id}", response_model=WorkshopResponse)
def get_workshop(workshop_id: int) -> WorkshopResponse:
    row = db_client.fetch_one(
        """
        SELECT id, name, full_date, start_date, time, instructor, price_vnd, package,
               audience, workshop_type, available_slots, total_slots
        FROM workshops
        WHERE id = ? AND status = 'available'
        """,
        (workshop_id,),
    )
    if row:
        return WorkshopResponse(**row)

    for workshop in WORKSHOPS:
        if workshop["id"] == workshop_id:
            return WorkshopResponse(**workshop)

    raise HTTPException(status_code=404, detail="Workshop not found")
