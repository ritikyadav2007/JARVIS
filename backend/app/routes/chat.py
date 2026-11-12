"""
JARVIS — Chat Route  (Phase 2)

Exposes:
    POST /api/chat

Request body (JSON):
    {
        "message": "...",                    # required, 1–2000 chars
        "previous_interaction_id": "..."     # optional — links to prior turn
    }

Success response (HTTP 200):
    {
        "reply": "...",
        "interaction_id": "..."
    }

Error response (see _ERROR_STATUS map below):
    {
        "detail": "..."    # human-readable, no stack traces or key material
    }

Security contract:
    - API keys are NEVER present in any response body, header, or log emitted
      by this module.
    - Raw provider error messages (which may contain key fragments) are caught
      in gemini_service.py and replaced with sanitised strings before they
      reach here.
    - Input is validated by Pydantic before the service is called.
"""

import logging
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator

from app.services.gemini_service import ask_jarvis

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["chat"])

# ---------------------------------------------------------------------------
# Map service error codes → HTTP status codes
# ---------------------------------------------------------------------------
_ERROR_STATUS: dict[str, int] = {
    "config_error": 503,   # Service Unavailable — API key not configured
    "auth_error":   503,   # Service Unavailable — key invalid/expired
    "rate_limit":   429,   # Too Many Requests
    "timeout":      504,   # Gateway Timeout
    "api_error":    502,   # Bad Gateway — upstream Gemini error
    "internal_error": 500, # Internal Server Error
}


# ---------------------------------------------------------------------------
# Request / Response models (Pydantic validates automatically)
# ---------------------------------------------------------------------------

class ChatRequest(BaseModel):
    """Body expected on POST /api/chat."""

    message: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="The user's message to JARVIS (1–2000 characters).",
    )
    previous_interaction_id: Optional[str] = Field(
        default=None,
        description=(
            "ID returned by the previous /api/chat call. "
            "Pass it back to continue a multi-turn conversation."
        ),
    )
    conversation_id: Optional[str] = Field(
        default=None,
        description="Local conversation ID to persist and group messages into.",
    )

    @field_validator("message")
    @classmethod
    def message_must_not_be_blank(cls, v: str) -> str:
        """Reject messages that are only whitespace."""
        if not v.strip():
            raise ValueError("message must not be blank or whitespace only.")
        return v.strip()


class ChatResponse(BaseModel):
    """Body returned on a successful POST /api/chat."""

    reply: str
    interaction_id: Optional[str]
    conversation_id: Optional[str] = None


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------

@router.post(
    "/chat",
    response_model=ChatResponse,
    summary="Send a message to JARVIS",
    description=(
        "Sends a text message to the Gemini-powered JARVIS AI. "
        "On the first turn omit `previous_interaction_id`; on subsequent turns "
        "pass the `interaction_id` returned by the previous response to maintain "
        "conversation memory."
    ),
)
async def chat(body: ChatRequest) -> ChatResponse:
    """
    Main chat endpoint.

    1. Calls ask_jarvis() with the validated message.
    2. On success  → returns reply + interaction_id (HTTP 200).
    3. On any error → raises HTTPException with a sanitised detail string;
                      no internal details, stack traces, or key material leak.
    """
    logger.info(
        "POST /api/chat | msg_len=%d | has_prev_id=%s | conv_id=%s",
        len(body.message),
        body.previous_interaction_id is not None,
        body.conversation_id,
    )

    result = await ask_jarvis(
        message=body.message,
        previous_interaction_id=body.previous_interaction_id,
        conversation_id=body.conversation_id,
    )

    # Service signals an error via the "error" key rather than raising.
    error_code = result.get("error")
    if error_code:
        status_code = _ERROR_STATUS.get(error_code, 500)
        # result["reply"] already contains a safe, friendly message.
        raise HTTPException(status_code=status_code, detail=result["reply"])

    return ChatResponse(
        reply=result["reply"],
        interaction_id=result["interaction_id"],
        conversation_id=result.get("conversation_id"),
    )
