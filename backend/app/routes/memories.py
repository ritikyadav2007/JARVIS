"""
JARVIS — Local Memory & Conversation API Routes

Exposes endpoints for managing local memories and conversations:
    POST   /api/memories               - Store an approved memory
    GET    /api/memories               - List all approved memories
    GET    /api/memories/search        - Search memories by keywords
    GET    /api/memories/{memory_id}   - Get a single memory
    PUT    /api/memories/{memory_id}   - Update a memory
    DELETE /api/memories/{memory_id}   - Delete an individual memory
    GET    /api/conversations          - List all conversations
    GET    /api/conversations/{conv_id}/messages - List messages in conversation
    DELETE /api/conversations/{conv_id} - Delete a conversation
    POST   /api/conversations/clear    - Clear all conversation history (requires confirmation)
"""

import logging
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field, field_validator

from app.db import repositories as repo

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["memories"])


# ─────────────────────────────────────────────────────────────────────────────
# Pydantic Schemas
# ─────────────────────────────────────────────────────────────────────────────

class MemoryCreateRequest(BaseModel):
    content: str = Field(
        ...,
        min_length=1,
        max_length=1000,
        description="Text of the memory to save (e.g. preference, goal, project, or fact).",
    )
    category: str = Field(
        default="fact",
        description="Category: preference, project, goal, fact, or other.",
    )
    is_approved: bool = Field(
        default=True,
        description="Explicit user approval to retain this long-term memory.",
    )

    @field_validator("content")
    @classmethod
    def content_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Memory content cannot be blank.")
        return v.strip()

    @field_validator("category")
    @classmethod
    def category_valid(cls, v: str) -> str:
        cat = v.strip().lower()
        if cat not in repo.VALID_CATEGORIES:
            raise ValueError(f"Category must be one of: {', '.join(sorted(repo.VALID_CATEGORIES))}")
        return cat


class MemoryUpdateRequest(BaseModel):
    content: Optional[str] = Field(default=None, min_length=1, max_length=1000)
    category: Optional[str] = None
    is_approved: Optional[bool] = None

    @field_validator("content")
    @classmethod
    def content_not_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            raise ValueError("Memory content cannot be blank.")
        return v.strip() if v else None

    @field_validator("category")
    @classmethod
    def category_valid(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            cat = v.strip().lower()
            if cat not in repo.VALID_CATEGORIES:
                raise ValueError(f"Category must be one of: {', '.join(sorted(repo.VALID_CATEGORIES))}")
            return cat
        return None


class MemoryResponse(BaseModel):
    id: str
    category: str
    content: str
    source: str
    is_approved: bool
    created_at: str
    updated_at: str


class ConversationResponse(BaseModel):
    id: str
    title: str
    created_at: str
    updated_at: str


class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    interaction_id: Optional[str]
    created_at: str


class ClearHistoryRequest(BaseModel):
    confirmed: bool = Field(
        ...,
        description="Explicit user confirmation to clear all conversation history.",
    )


class ClearHistoryResponse(BaseModel):
    deleted_conversations: int
    message: str


# ─────────────────────────────────────────────────────────────────────────────
# Memory Endpoints
# ─────────────────────────────────────────────────────────────────────────────

@router.post(
    "/memories",
    response_model=MemoryResponse,
    status_code=201,
    summary="Add an approved long-term memory",
)
def create_memory(body: MemoryCreateRequest) -> MemoryResponse:
    """Store a user-approved preference, goal, project, or fact."""
    try:
        mem = repo.add_memory(
            content=body.content,
            category=body.category,
            source="user",
            is_approved=body.is_approved,
        )
        return MemoryResponse(**mem)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Failed to create memory: %s", e)
        raise HTTPException(status_code=500, detail="Failed to save memory record.")


@router.get(
    "/memories",
    response_model=List[MemoryResponse],
    summary="List stored memories",
)
def list_memories(
    category: Optional[str] = Query(None, description="Optional category filter"),
    only_approved: bool = Query(True, description="Only return user-approved memories"),
    limit: int = Query(100, ge=1, le=200),
) -> List[MemoryResponse]:
    """Retrieve saved long-term memories."""
    mems = repo.list_memories(category=category, only_approved=only_approved, limit=limit)
    return [MemoryResponse(**m) for m in mems]


@router.get(
    "/memories/search",
    response_model=List[MemoryResponse],
    summary="Search memories",
)
def search_memories(
    q: str = Query(..., min_length=1, description="Keywords to search in memories"),
    limit: int = Query(10, ge=1, le=50),
) -> List[MemoryResponse]:
    """Search stored memories by keywords."""
    results = repo.search_memories(query=q, limit=limit, only_approved=True)
    return [MemoryResponse(**m) for m in results]


@router.get(
    "/memories/{memory_id}",
    response_model=MemoryResponse,
    summary="Get a single memory",
)
def get_memory(memory_id: str) -> MemoryResponse:
    mem = repo.get_memory(memory_id)
    if not mem:
        raise HTTPException(status_code=404, detail="Memory not found.")
    return MemoryResponse(**mem)


@router.put(
    "/memories/{memory_id}",
    response_model=MemoryResponse,
    summary="Update a memory",
)
def update_memory(memory_id: str, body: MemoryUpdateRequest) -> MemoryResponse:
    try:
        updated = repo.update_memory(
            memory_id=memory_id,
            content=body.content,
            category=body.category,
            is_approved=body.is_approved,
        )
        if not updated:
            raise HTTPException(status_code=404, detail="Memory not found.")
        return MemoryResponse(**updated)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to update memory: %s", e)
        raise HTTPException(status_code=500, detail="Failed to update memory record.")


@router.delete(
    "/memories/{memory_id}",
    status_code=204,
    summary="Delete an individual memory",
)
def delete_memory(memory_id: str):
    success = repo.delete_memory(memory_id)
    if not success:
        raise HTTPException(status_code=404, detail="Memory not found.")
    return None


# ─────────────────────────────────────────────────────────────────────────────
# Conversation History Endpoints
# ─────────────────────────────────────────────────────────────────────────────

@router.get(
    "/conversations",
    response_model=List[ConversationResponse],
    summary="List conversations",
)
def list_conversations(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
) -> List[ConversationResponse]:
    """List all local conversations ordered by last active."""
    convs = repo.list_conversations(limit=limit, offset=offset)
    return [ConversationResponse(**c) for c in convs]


@router.get(
    "/conversations/{conv_id}/messages",
    response_model=List[MessageResponse],
    summary="Get conversation messages",
)
def get_messages(
    conv_id: str,
    limit: int = Query(50, ge=1, le=200),
) -> List[MessageResponse]:
    """Retrieve message history for a specific conversation."""
    conv = repo.get_conversation(conv_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")
    msgs = repo.get_conversation_messages(conv_id=conv_id, limit=limit)
    return [MessageResponse(**m) for m in msgs]


@router.delete(
    "/conversations/{conv_id}",
    status_code=204,
    summary="Delete a single conversation",
)
def delete_conversation(conv_id: str):
    """Delete a conversation and all its messages."""
    success = repo.delete_conversation(conv_id)
    if not success:
        raise HTTPException(status_code=404, detail="Conversation not found.")
    return None


@router.post(
    "/conversations/clear",
    response_model=ClearHistoryResponse,
    summary="Clear all conversation history with confirmation",
)
def clear_all_history(body: ClearHistoryRequest) -> ClearHistoryResponse:
    """Wipe all conversations and messages with user confirmation."""
    if not body.confirmed:
        raise HTTPException(status_code=400, detail="Confirmation required to clear history.")
    count = repo.clear_all_conversations(confirmed=True)
    return ClearHistoryResponse(
        deleted_conversations=count,
        message=f"Successfully cleared {count} conversation(s) and associated message history.",
    )
