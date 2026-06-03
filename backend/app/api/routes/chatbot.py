import json
import uuid

from fastapi import APIRouter, Query

from app.db.database import db_client
from app.models.schemas import (
    ChatbotRecommendationResponse,
    ChatbotSessionResponse,
    ChatbotSessionUpsertRequest,
)

router = APIRouter()


def _tags_from_payload(payload: ChatbotSessionUpsertRequest) -> list[str]:
    tags = set(payload.behavior_tags)
    if payload.purpose == "gift":
        tags.add("gifting")
    if payload.purpose == "relax":
        tags.add("evening_learner")
    if payload.experience_level == "first_time":
        tags.add("first_timer")
    if payload.experience_level == "experienced":
        tags.add("premium")
    if payload.style_preference == "colorful":
        tags.add("color_lover")
    if payload.style_preference == "minimal":
        tags.add("minimalist")
    if payload.style_preference == "natural":
        tags.add("natural")
    return sorted(tags)


def _recommend(payload: ChatbotSessionUpsertRequest) -> int:
    custom = (payload.custom_request or "").lower()
    if payload.experience_level == "experienced" or "premium" in custom or "riêng" in custom:
        return 5
    if payload.purpose == "gift":
        return 3
    if payload.purpose == "home" or payload.style_preference == "natural":
        return 6
    if payload.style_preference == "colorful":
        return 2
    if payload.purpose == "relax":
        return 10
    return 1


def _row_to_response(row: dict) -> ChatbotSessionResponse:
    raw_tags = row.get("behavior_tags") or "[]"
    try:
        tags = json.loads(raw_tags)
    except json.JSONDecodeError:
        tags = [tag for tag in raw_tags.split(",") if tag]

    return ChatbotSessionResponse(
        session_id=row["session_id"],
        user_id=row.get("user_id"),
        style_preference=row.get("style_preference"),
        experience_level=row.get("experience_level"),
        purpose=row.get("purpose"),
        custom_request=row.get("custom_request"),
        recommended_workshop_id=row.get("recommended_workshop_id"),
        behavior_tags=tags,
        created_at=row.get("created_at"),
    )


@router.post("/session", response_model=ChatbotSessionResponse)
def create_session(payload: ChatbotSessionUpsertRequest) -> ChatbotSessionResponse:
    session_id = payload.session_id or f"chat-{uuid.uuid4().hex[:12]}"
    recommended_workshop_id = payload.recommended_workshop_id or _recommend(payload)
    tags = _tags_from_payload(payload)

    db_client.execute(
        """
        INSERT INTO chatbot_sessions (
            session_id, user_id, style_preference, experience_level, purpose,
            custom_request, recommended_workshop_id, behavior_tags
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(session_id) DO UPDATE SET
            user_id = excluded.user_id,
            style_preference = excluded.style_preference,
            experience_level = excluded.experience_level,
            purpose = excluded.purpose,
            custom_request = excluded.custom_request,
            recommended_workshop_id = excluded.recommended_workshop_id,
            behavior_tags = excluded.behavior_tags
        """,
        (
            session_id,
            payload.user_id,
            payload.style_preference,
            payload.experience_level,
            payload.purpose,
            payload.custom_request,
            recommended_workshop_id,
            json.dumps(tags, ensure_ascii=False),
        ),
    )

    row = db_client.fetch_one("SELECT * FROM chatbot_sessions WHERE session_id = ?", (session_id,))
    if row:
        return _row_to_response(row)

    return ChatbotSessionResponse(
        session_id=session_id,
        user_id=payload.user_id,
        style_preference=payload.style_preference,
        experience_level=payload.experience_level,
        purpose=payload.purpose,
        custom_request=payload.custom_request,
        recommended_workshop_id=recommended_workshop_id,
        behavior_tags=tags,
    )


@router.patch("/session/{session_id}", response_model=ChatbotSessionResponse)
def update_session(session_id: str, payload: ChatbotSessionUpsertRequest) -> ChatbotSessionResponse:
    return create_session(payload.model_copy(update={"session_id": session_id}))


@router.get("/recommend", response_model=ChatbotRecommendationResponse)
def recommend(session_id: str = Query(min_length=3, max_length=80)) -> ChatbotRecommendationResponse:
    row = db_client.fetch_one("SELECT * FROM chatbot_sessions WHERE session_id = ?", (session_id,))
    if not row:
        return ChatbotRecommendationResponse(
            session_id=session_id,
            recommended_workshop_id=1,
            reason="Fallback cho khách mới: workshop nặn gốm cơ bản dễ bắt đầu.",
            behavior_tags=["first_timer"],
        )

    session = _row_to_response(row)
    reason = "Gợi ý dựa trên phong cách, kinh nghiệm và mục đích khách đã chọn trong chatbot."
    return ChatbotRecommendationResponse(
        session_id=session.session_id,
        recommended_workshop_id=session.recommended_workshop_id or 1,
        reason=reason,
        behavior_tags=session.behavior_tags,
    )
