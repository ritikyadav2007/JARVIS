"""
JARVIS — Gemini AI Service (Phase 2)

Wraps the google-genai SDK (v3.0.0+) for async chat interactions.

Security rules:
  - The API key is read ONLY from the Settings object (which loads backend/.env).
  - The key is never logged, returned in responses, or passed to the frontend.
  - If the key is absent, every chat call returns a clear config-error message
    rather than crashing the entire FastAPI process.

Conversation memory:
  - google-genai stores conversation history server-side.
  - Multi-turn context is maintained by passing `previous_interaction_id` on
    each subsequent turn — the client sends no history array, keeping payloads
    small and preventing client-side tampering.
"""

import asyncio
import logging
from typing import Any, Optional

from google import genai
from google.genai import errors

from app.core.config import settings
from app.db import repositories as repo

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Module-level GenAI client — created once, reused for all requests.
# It is set to None when the API key is missing so the app starts cleanly.
# ---------------------------------------------------------------------------
_client: Optional[genai.Client] = None


def _get_client() -> Optional[genai.Client]:
    """
    Return the shared genai.Client, creating it lazily on first call.

    Returns None (instead of raising) when GEMINI_API_KEY is not configured,
    so FastAPI can start and serve health checks while chat returns a friendly
    error — rather than refusing to boot at all.
    """
    global _client

    if _client is not None:
        return _client

    api_key = settings.gemini_api_key.strip()
    if not api_key:
        logger.warning(
            "GEMINI_API_KEY is not set in backend/.env. "
            "Chat requests will return a configuration error until the key is added."
        )
        return None

    _client = genai.Client(api_key=api_key)
    logger.info("Gemini Client initialised with async interface (model: %s).", settings.gemini_model)
    return _client


# ---------------------------------------------------------------------------
# Public interface
# ---------------------------------------------------------------------------

async def ask_jarvis(
    message: str,
    previous_interaction_id: Optional[str] = None,
    conversation_id: Optional[str] = None,
) -> dict:
    """
    Send a message to Gemini with local memory context and return a result dict.

    Args:
        message: The user's text message (already validated by the router).
        previous_interaction_id: The ID returned by the previous Gemini
            interaction in this conversation, enabling server-side multi-turn
            memory. Pass None to start a fresh conversation.
        conversation_id: Optional local SQLite conversation identifier.
            If omitted, a new conversation is created automatically.

    Returns:
        On success:
            {
                "reply": "<JARVIS response text>",
                "interaction_id": "<str>",   # pass back on next turn
                "conversation_id": "<str>",  # local SQLite conversation id
                "error": None,
            }
        On any failure:
            {
                "reply": "<friendly error message>",
                "interaction_id": None,
                "conversation_id": "<str>" | None,
                "error": "<error_code>",   # e.g. "config_error", "timeout", ...
            }
    """
    client = _get_client()

    # --- Ensure conversation session & persist user message ----------------
    active_conv_id: Optional[str] = None
    try:
        conv = repo.get_or_create_conversation(conv_id=conversation_id, first_message=message)
        active_conv_id = conv["id"]
        repo.add_message(conv_id=active_conv_id, role="user", content=message)
    except Exception as e:
        logger.warning("Could not persist incoming user message to local SQLite: %s", e)

    # --- Missing API key ---------------------------------------------------
    if client is None:
        return {
            "reply": (
                "⚠️ JARVIS is not fully configured yet. "
                "The GEMINI_API_KEY is missing from backend/.env. "
                "Add it and restart the backend server."
            ),
            "interaction_id": None,
            "conversation_id": active_conv_id,
            "error": "config_error",
        }

    # --- Retrieve relevant local memories ----------------------------------
    memory_prompt_section = ""
    try:
        # Search for approved memories relevant to the user's message
        relevant_memories = repo.search_memories(query=message, limit=5, only_approved=True)
        if not relevant_memories:
            # Fall back to general preferences/projects if query didn't match specific terms
            relevant_memories = repo.list_memories(only_approved=True, limit=5)

        if relevant_memories:
            lines = [f"- [{m['category'].upper()}] {m['content']}" for m in relevant_memories]
            memory_prompt_section = (
                "\n\n[USER LOCAL MEMORY & PREFERENCES]\n"
                "The following user-approved facts and preferences are stored locally on this machine:\n"
                + "\n".join(lines) +
                "\nGuideline: Use these memories for helpful personalized context. "
                "However, if the user's latest instruction contradicts any stored memory, "
                "ALWAYS prioritize the user's latest instruction over the memory."
            )
    except Exception as e:
        logger.warning("Could not retrieve local memories: %s", e)

    # --- Build the request kwargs -----------------------------------------
    # `system_instruction` gives JARVIS its personality and local memory context.
    # `store=True` keeps history on Google's servers.
    # `previous_interaction_id` links this turn to the previous one for memory.
    system_instruction = (
        "You are JARVIS, a highly intelligent and helpful personal AI assistant "
        "running on a MacBook Air. You are concise, technically precise, and "
        "occasionally witty — in the spirit of the fictional JARVIS from Iron Man. "
        "You help with coding, system questions, research, and daily tasks. "
        "You do not have access to the user's microphone or Mac automation tools yet."
        f"{memory_prompt_section}"
    )

    kwargs: dict = {
        "model": settings.gemini_model,
        "input": message,
        "system_instruction": system_instruction,
        "store": True,
        "timeout": 30.0,
    }

    if previous_interaction_id:
        kwargs["previous_interaction_id"] = previous_interaction_id

    # --- Call Gemini -------------------------------------------------------
    try:
        interaction = await asyncio.wait_for(
            client.aio.interactions.create(**kwargs),
            timeout=35.0,
        )
        reply_text = interaction.output_text or "(JARVIS returned an empty response.)"

        # Persist assistant reply to local conversation history
        if active_conv_id:
            try:
                repo.add_message(
                    conv_id=active_conv_id,
                    role="assistant",
                    content=reply_text,
                    interaction_id=interaction.id,
                )
            except Exception as e:
                logger.warning("Could not persist assistant reply to local SQLite: %s", e)

        return {
            "reply": reply_text,
            "interaction_id": interaction.id,
            "conversation_id": active_conv_id,
            "error": None,
        }

    except Exception as exc:
        err_name = type(exc).__name__
        status = getattr(exc, "status_code", None) or getattr(exc, "code", None)
        err_str = str(exc)

        # 1. Authentication / Permission errors (401, 403, bad API key)
        if (
            err_name in ("AuthenticationError", "PermissionDeniedError")
            or status in (401, 403)
            or "API_KEY_INVALID" in err_str
            or "PERMISSION_DENIED" in err_str
        ):
            logger.error("Gemini authentication failed — check that GEMINI_API_KEY is valid.")
            return {
                "reply": (
                    "⚠️ JARVIS cannot reach its AI brain: the Gemini API key is invalid or expired. "
                    "Please check the GEMINI_API_KEY value in backend/.env."
                ),
                "interaction_id": None,
                "conversation_id": active_conv_id,
                "error": "auth_error",
            }

        # 2. Rate limiting / Quota exhaustion (429)
        if (
            err_name == "RateLimitError"
            or status == 429
            or "RESOURCE_EXHAUSTED" in err_str
        ):
            logger.warning("Gemini rate limit hit.")
            return {
                "reply": (
                    "⚠️ JARVIS hit the Gemini API rate limit. "
                    "Please wait a moment and try again."
                ),
                "interaction_id": None,
                "conversation_id": active_conv_id,
                "error": "rate_limit",
            }

        # 3. Timeouts and Network Connection failures (504, 408, DNS/TCP drops)
        if (
            err_name in (
                "APITimeoutError",
                "APIConnectionError",
                "TimeoutException",
                "ConnectError",
                "ContinuationInterruptedError",
                "TimeoutError",
            )
            or isinstance(exc, (TimeoutError, asyncio.TimeoutError, ConnectionError))
            or status in (504, 408)
        ):
            logger.warning("Gemini request timed out or connection failed: %s", err_name)
            return {
                "reply": (
                    "⚠️ JARVIS's AI brain took too long to respond or could not connect. "
                    "Check your internet connection and try again."
                ),
                "interaction_id": None,
                "conversation_id": active_conv_id,
                "error": "timeout",
            }

        # 4. General Gemini API / Server errors
        if isinstance(exc, errors.APIError) or "APIError" in err_name or "ServerError" in err_name:
            logger.error("Gemini API error (%s): %s", err_name, exc)
            return {
                "reply": "⚠️ JARVIS encountered an AI service error. Please try again in a moment.",
                "interaction_id": None,
                "conversation_id": active_conv_id,
                "error": "api_error",
            }

        # 5. Unexpected internal errors
        logger.exception("Unexpected error in ask_jarvis: %s", exc)
        return {
            "reply": (
                "⚠️ JARVIS hit an unexpected internal error. "
                "Check the backend logs for details."
            ),
            "interaction_id": None,
            "conversation_id": active_conv_id,
            "error": "internal_error",
        }
