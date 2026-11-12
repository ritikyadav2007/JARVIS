"""
JARVIS — Privacy & Security Utilities

Provides detection and sanitization for secrets, tokens, API keys, and
sensitive credentials to prevent accidental persistence into SQLite memory.
"""

import re
from typing import Tuple

# Common secret regex patterns
_SECRET_PATTERNS = [
    # Google / Gemini API Keys (AIzaSy...)
    re.compile(r"AIza[0-9A-Za-z-_]{30,45}", re.IGNORECASE),
    # OpenAI API Keys (sk-...)
    re.compile(r"sk-[a-zA-Z0-9_-]{20,}", re.IGNORECASE),
    # GitHub Personal Access Tokens
    re.compile(r"gh[pousr]_[0-9a-zA-Z]{36,}", re.IGNORECASE),
    # AWS Access Key IDs
    re.compile(r"(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}", re.IGNORECASE),
    # Slack Tokens
    re.compile(r"xox[baprs]-[0-9a-zA-Z]{10,48}", re.IGNORECASE),
    # Generic Bearer Tokens
    re.compile(r"Bearer\s+[A-Za-z0-9._~+\/=-]{20,}", re.IGNORECASE),
    # Private Key Headers
    re.compile(r"-----BEGIN\s+[A-Z\s]+PRIVATE\s+KEY-----", re.IGNORECASE),
    # Password / Token assignment patterns in text (e.g. password="secret123", api_key='...')
    re.compile(r"(?:api[_-]?key|access[_-]?token|secret|password|passwd)\s*[:=]\s*['\"]?([A-Za-z0-9!@#$%^&*()_+\-={}\[\]:;<>,.?/~`]{8,})['\"]?", re.IGNORECASE),
]


def contains_sensitive_data(text: str) -> bool:
    """Return True if text contains recognizable API keys, tokens, or credentials."""
    if not text:
        return False
    for pattern in _SECRET_PATTERNS:
        if pattern.search(text):
            return True
    return False


def sanitize_text(text: str) -> str:
    """
    Redact recognizable API keys, tokens, or passwords from text before storing
    in SQLite local memory.
    """
    if not text:
        return text

    sanitized = text
    for pattern in _SECRET_PATTERNS:
        sanitized = pattern.sub("[REDACTED_SECRET]", sanitized)

    return sanitized
