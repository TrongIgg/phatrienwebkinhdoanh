from fastapi import APIRouter

from app.models.schemas import ReviewCreateRequest
from app.db.database import db_client

router = APIRouter()

REVIEW_STORE: list[dict] = [
    {
        "review_id": 1,
        "name": "Nguyen Thu Ha",
        "title": "Rat dang thu",
        "comment": "Khong gian am, nghe nhan chi tung buoc nen minh khong bi ngop.",
        "rating": 5,
    }
]


@router.get("")
def list_reviews() -> list[dict]:
    rows = db_client.fetch_all(
        """
        SELECT review_id, name, title, comment, rating, target_type, target_id, created_at
        FROM reviews
        ORDER BY review_id DESC
        """
    )
    return rows or REVIEW_STORE


@router.post("", status_code=201)
def create_review(payload: ReviewCreateRequest) -> dict:
    review_id = db_client.insert(
        """
        INSERT INTO reviews (target_type, target_id, name, title, comment, rating)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        ("product", None, payload.name, payload.title, payload.comment, payload.rating),
    )
    if review_id:
        return {"review_id": review_id, "target_type": "product", "target_id": None, **payload.model_dump()}

    review = {"review_id": len(REVIEW_STORE) + 1, "target_type": "product", "target_id": None, **payload.model_dump()}
    REVIEW_STORE.insert(0, review)
    return review
