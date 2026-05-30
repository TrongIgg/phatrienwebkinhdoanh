import logging

logger = logging.getLogger(__name__)


def analyze_image_and_match_products(image_url: str) -> tuple[list[str], list[int]]:
    """
    Placeholder image pipeline.
    Replace this logic with Google Vision / AWS Rekognition integration.
    """
    try:
        normalized = image_url.lower()
        tags = ["ceramic", "handmade"]
        matches = [101, 102]

        if "vase" in normalized:
            tags.append("vase")
            matches = [201, 202]
        elif "cup" in normalized:
            tags.append("cup")
            matches = [301, 302]

        return tags, matches
    except Exception:
        logger.exception("Image pipeline failed for image_url=%s", image_url)
        raise
