import logging

from fastapi import APIRouter, HTTPException

from app.models.schemas import SearchImageRequest, SearchImageResponse
from app.services.image_search_service import analyze_image_and_match_products

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/image", response_model=SearchImageResponse)
def search_by_image(payload: SearchImageRequest) -> SearchImageResponse:
    try:
        tags, matched_product_ids = analyze_image_and_match_products(payload.image_url)
        return SearchImageResponse(tags=tags, matched_product_ids=matched_product_ids)
    except Exception as exc:
        logger.exception("Failed processing image search request: %s", payload.image_url)
        raise HTTPException(
            status_code=500,
            detail="Image processing pipeline failed",
        ) from exc
