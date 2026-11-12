"""
JARVIS — Local Memory & Conversation Repositories

Provides safe, parameterized SQLite operations for conversations, messages,
and user-approved long-term memory records.
"""

import datetime
import logging
import uuid
from typing import Any, Dict, List, Optional

from app.core.security import contains_sensitive_data, sanitize_text
from app.db.database import get_db

logger = logging.getLogger(__name__)

# Allowed memory categories
VALID_CATEGORIES = {"preference", "project", "goal", "fact", "other"}


def _utc_now_iso() -> str:
    """Return current UTC timestamp in ISO 8601 format."""
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


# ─────────────────────────────────────────────────────────────────────────────
# 1. Conversations
# ─────────────────────────────────────────────────────────────────────────────

def create_conversation(
    title: Optional[str] = None,
    conv_id: Optional[str] = None,
) -> Dict[str, Any]:
    """Create a new conversation session."""
    cid = conv_id or f"conv_{uuid.uuid4().hex[:12]}"
    now = _utc_now_iso()
    t = (title or "New Conversation").strip()[:100]

    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO conversations (id, title, created_at, updated_at)
            VALUES (?, ?, ?, ?);
            """,
            (cid, t, now, now),
        )

    return {"id": cid, "title": t, "created_at": now, "updated_at": now}


def get_conversation(conv_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve a conversation by ID."""
    with get_db() as conn:
        row = conn.execute(
            "SELECT id, title, created_at, updated_at FROM conversations WHERE id = ?;",
            (conv_id,),
        ).fetchone()
        return dict(row) if row else None


def get_or_create_conversation(
    conv_id: Optional[str] = None,
    first_message: Optional[str] = None,
) -> Dict[str, Any]:
    """Retrieve existing conversation or create a new one."""
    if conv_id:
        existing = get_conversation(conv_id)
        if existing:
            return existing

    # Create sensible title from first message if available
    title = "New Conversation"
    if first_message:
        clean = first_message.strip().split("\n")[0]
        title = (clean[:40] + "...") if len(clean) > 40 else clean

    return create_conversation(title=title, conv_id=conv_id)


def list_conversations(limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
    """List recent conversations ordered by last update."""
    with get_db() as conn:
        rows = conn.execute(
            """
            SELECT id, title, created_at, updated_at
            FROM conversations
            ORDER BY updated_at DESC
            LIMIT ? OFFSET ?;
            """,
            (max(1, min(limit, 100)), max(0, offset)),
        ).fetchall()
        return [dict(r) for r in rows]


def delete_conversation(conv_id: str) -> bool:
    """Delete a conversation and its messages via CASCADE."""
    with get_db() as conn:
        cursor = conn.execute("DELETE FROM conversations WHERE id = ?;", (conv_id,))
        return cursor.rowcount > 0


def clear_all_conversations(confirmed: bool = False) -> int:
    """
    Clear all conversation history. Requires explicit confirmation flag.
    Returns the count of deleted conversations.
    """
    if not confirmed:
        raise ValueError("Clearing conversation history requires explicit confirmation (confirmed=True).")

    with get_db() as conn:
        count = conn.execute("SELECT COUNT(*) FROM conversations;").fetchone()[0]
        conn.execute("DELETE FROM messages;")
        conn.execute("DELETE FROM conversations;")
        return count


# ─────────────────────────────────────────────────────────────────────────────
# 2. Conversation Messages
# ─────────────────────────────────────────────────────────────────────────────

def add_message(
    conv_id: str,
    role: str,
    content: str,
    interaction_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Add a message to a conversation. Sanitizes credentials before persisting.
    Automatically touches updated_at on the parent conversation.
    """
    if role not in ("user", "assistant", "system"):
        raise ValueError(f"Invalid message role '{role}'. Must be 'user', 'assistant', or 'system'.")

    # Sanitize content against accidental API key/token leakage
    clean_content = sanitize_text(content.strip())
    mid = f"msg_{uuid.uuid4().hex[:12]}"
    now = _utc_now_iso()

    with get_db() as conn:
        # Ensure conversation exists
        conv = conn.execute("SELECT id FROM conversations WHERE id = ?;", (conv_id,)).fetchone()
        if not conv:
            conn.execute(
                "INSERT INTO conversations (id, title, created_at, updated_at) VALUES (?, ?, ?, ?);",
                (conv_id, clean_content[:40], now, now),
            )

        conn.execute(
            """
            INSERT INTO messages (id, conversation_id, role, content, interaction_id, created_at)
            VALUES (?, ?, ?, ?, ?, ?);
            """,
            (mid, conv_id, role, clean_content, interaction_id, now),
        )

        # Update parent conversation timestamp
        conn.execute("UPDATE conversations SET updated_at = ? WHERE id = ?;", (now, conv_id))

    return {
        "id": mid,
        "conversation_id": conv_id,
        "role": role,
        "content": clean_content,
        "interaction_id": interaction_id,
        "created_at": now,
    }


def get_conversation_messages(conv_id: str, limit: int = 50) -> List[Dict[str, Any]]:
    """Retrieve recent messages for a conversation ordered chronologically."""
    with get_db() as conn:
        rows = conn.execute(
            """
            SELECT id, conversation_id, role, content, interaction_id, created_at
            FROM messages
            WHERE conversation_id = ?
            ORDER BY created_at ASC
            LIMIT ?;
            """,
            (conv_id, max(1, min(limit, 200))),
        ).fetchall()
        return [dict(r) for r in rows]


# ─────────────────────────────────────────────────────────────────────────────
# 3. Long-Term Memories
# ─────────────────────────────────────────────────────────────────────────────

def add_memory(
    content: str,
    category: str = "fact",
    source: str = "user",
    is_approved: bool = True,
) -> Dict[str, Any]:
    """
    Store an approved long-term memory item (preference, goal, project, or fact).
    Sanitizes credentials and rejects entries containing high-risk secrets.
    """
    clean_text = content.strip()
    if not clean_text:
        raise ValueError("Memory content cannot be blank.")

    cat = category.strip().lower()
    if cat not in VALID_CATEGORIES:
        cat = "other"

    # Reject blatant secret storage
    if contains_sensitive_data(clean_text):
        logger.warning("Rejected attempt to store sensitive secret in local memory.")
        raise ValueError("Memory content contains sensitive tokens or credentials and cannot be saved.")

    clean_text = sanitize_text(clean_text)
    mid = f"mem_{uuid.uuid4().hex[:12]}"
    now = _utc_now_iso()

    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO memories (id, category, content, source, is_approved, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?);
            """,
            (mid, cat, clean_text, source, 1 if is_approved else 0, now, now),
        )

    logger.info("Saved local memory [%s]: %s...", cat, clean_text[:40])
    return {
        "id": mid,
        "category": cat,
        "content": clean_text,
        "source": source,
        "is_approved": bool(is_approved),
        "created_at": now,
        "updated_at": now,
    }


def get_memory(memory_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve a single memory by ID."""
    with get_db() as conn:
        row = conn.execute(
            """
            SELECT id, category, content, source, is_approved, created_at, updated_at
            FROM memories
            WHERE id = ?;
            """,
            (memory_id,),
        ).fetchone()
        if not row:
            return None
        res = dict(row)
        res["is_approved"] = bool(res["is_approved"])
        return res


def list_memories(
    category: Optional[str] = None,
    only_approved: bool = True,
    limit: int = 100,
) -> List[Dict[str, Any]]:
    """List stored memories with optional category filtering."""
    query = "SELECT id, category, content, source, is_approved, created_at, updated_at FROM memories WHERE 1=1"
    params: List[Any] = []

    if only_approved:
        query += " AND is_approved = 1"

    if category:
        cat = category.strip().lower()
        if cat in VALID_CATEGORIES:
            query += " AND category = ?"
            params.append(cat)

    query += " ORDER BY updated_at DESC LIMIT ?;"
    params.append(max(1, min(limit, 200)))

    with get_db() as conn:
        rows = conn.execute(query, params).fetchall()
        result = []
        for r in rows:
            d = dict(r)
            d["is_approved"] = bool(d["is_approved"])
            result.append(d)
        return result


def search_memories(
    query: str,
    limit: int = 10,
    only_approved: bool = True,
) -> List[Dict[str, Any]]:
    """
    Search memories by keywords across content and category.
    Returns matched items ranked by relevance.
    """
    clean_query = query.strip()
    if not clean_query:
        return list_memories(only_approved=only_approved, limit=limit)

    # Extract alphanumeric search tokens (ignore tiny 1-2 char noise)
    tokens = [t.lower() for t in clean_query.split() if len(t) > 2][:5]
    if not tokens:
        tokens = [clean_query.lower()]

    sql = """
        SELECT id, category, content, source, is_approved, created_at, updated_at
        FROM memories
        WHERE 1=1
    """
    params: List[Any] = []
    if only_approved:
        sql += " AND is_approved = 1"

    # Match any of the search tokens
    token_clauses = []
    for token in tokens:
        token_clauses.append("(LOWER(content) LIKE ? OR LOWER(category) LIKE ?)")
        params.extend([f"%{token}%", f"%{token}%"])

    if token_clauses:
        sql += " AND (" + " OR ".join(token_clauses) + ")"

    sql += " ORDER BY updated_at DESC LIMIT ?;"
    params.append(max(1, min(limit, 50)))

    with get_db() as conn:
        rows = conn.execute(sql, params).fetchall()
        result = []
        for r in rows:
            d = dict(r)
            d["is_approved"] = bool(d["is_approved"])
            result.append(d)
        return result


def update_memory(
    memory_id: str,
    content: Optional[str] = None,
    category: Optional[str] = None,
    is_approved: Optional[bool] = None,
) -> Optional[Dict[str, Any]]:
    """Update an existing memory."""
    existing = get_memory(memory_id)
    if not existing:
        return None

    updates = []
    params: List[Any] = []

    if content is not None:
        clean = content.strip()
        if not clean:
            raise ValueError("Memory content cannot be blank.")
        if contains_sensitive_data(clean):
            raise ValueError("Memory content contains sensitive tokens or credentials.")
        updates.append("content = ?")
        params.append(sanitize_text(clean))

    if category is not None:
        cat = category.strip().lower()
        if cat in VALID_CATEGORIES:
            updates.append("category = ?")
            params.append(cat)

    if is_approved is not None:
        updates.append("is_approved = ?")
        params.append(1 if is_approved else 0)

    if not updates:
        return existing

    now = _utc_now_iso()
    updates.append("updated_at = ?")
    params.append(now)

    params.append(memory_id)
    sql = f"UPDATE memories SET {', '.join(updates)} WHERE id = ?;"

    with get_db() as conn:
        conn.execute(sql, params)

    return get_memory(memory_id)


def delete_memory(memory_id: str) -> bool:
    """Delete a memory item by ID."""
    with get_db() as conn:
        cursor = conn.execute("DELETE FROM memories WHERE id = ?;", (memory_id,))
        return cursor.rowcount > 0
