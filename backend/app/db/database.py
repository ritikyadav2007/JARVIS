"""
JARVIS — Local SQLite Database Connection & Initialization

Manages the SQLite database stored at backend/data/jarvis.db.
Ensures directories and tables are automatically created on startup.
"""

import logging
import os
import sqlite3
from contextlib import contextmanager
from typing import Generator, Optional

from app.core.config import settings

logger = logging.getLogger(__name__)


def get_db_path(custom_path: Optional[str] = None) -> str:
    """Return the absolute path to the local SQLite database."""
    if custom_path:
        return os.path.abspath(custom_path)
    return settings.resolved_db_path


def init_db(custom_path: Optional[str] = None) -> str:
    """
    Initialize SQLite database directory, schema, and indexes.
    Safe to call multiple times (idempotent).
    """
    db_path = get_db_path(custom_path)
    db_dir = os.path.dirname(db_path)

    # 1. Automatically create directory if missing
    if db_dir and not os.path.exists(db_dir):
        os.makedirs(db_dir, exist_ok=True)
        logger.info("Created local database directory: %s", db_dir)

    # 2. Open connection and execute DDL
    with sqlite3.connect(db_path) as conn:
        conn.execute("PRAGMA foreign_keys = ON;")
        conn.execute("PRAGMA journal_mode = WAL;")

        cursor = conn.cursor()

        # Conversations Table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS conversations (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            """
        )

        # Messages Table (History)
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS messages (
                id TEXT PRIMARY KEY,
                conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
                role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
                content TEXT NOT NULL,
                interaction_id TEXT,
                created_at TEXT NOT NULL
            );
            """
        )
        cursor.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_messages_conv_created
            ON messages(conversation_id, created_at);
            """
        )

        # Long-Term Memory Table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS memories (
                id TEXT PRIMARY KEY,
                category TEXT NOT NULL CHECK(category IN ('preference', 'project', 'goal', 'fact', 'other')),
                content TEXT NOT NULL,
                source TEXT NOT NULL DEFAULT 'user',
                is_approved INTEGER NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            """
        )
        cursor.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_memories_category
            ON memories(category);
            """
        )
        cursor.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_memories_approved
            ON memories(is_approved);
            """
        )

        conn.commit()

    logger.info("JARVIS SQLite database initialized at: %s", db_path)
    return db_path


@contextmanager
def get_db(custom_path: Optional[str] = None) -> Generator[sqlite3.Connection, None, None]:
    """
    Context manager yielding a configured SQLite connection.
    Automatically commits on normal exit and rolls back on exception.
    """
    db_path = get_db_path(custom_path)

    # Ensure parent dir exists
    db_dir = os.path.dirname(db_path)
    if db_dir and not os.path.exists(db_dir):
        os.makedirs(db_dir, exist_ok=True)

    conn = sqlite3.connect(db_path, timeout=10.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
