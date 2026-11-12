import type { BackendStatus, HealthStatus, SystemMetrics, MemoryItem, ConversationItem } from '../types';

/**
 * JARVIS — Backend API Client
 *
 * Exclusively handles network communication with the FastAPI backend.
 * Uses Vite dev-server proxy so requests to /api are proxied to http://127.0.0.1:8000.
 *
 * Security rules:
 * - No Gemini API key in frontend code.
 * - Strict typing and friendly error messages.
 */

const BACKEND_URL =
  typeof window !== 'undefined'
    ? '' // Proxied by Vite to http://127.0.0.1:8000
    : 'http://127.0.0.1:8000';

interface ChatRequest {
  message: string;
  previous_interaction_id?: string;
  conversation_id?: string;
}

export interface ChatResponse {
  reply: string;
  interaction_id: string | null;
  conversation_id?: string | null;
}

interface ApiErrorBody {
  detail: string;
}

export class ChatError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ChatError';
    this.status = status;
  }
}

/**
 * Send a message to JARVIS and receive an AI response.
 */
export async function sendChatMessage(
  message: string,
  previousInteractionId?: string,
  conversationId?: string
): Promise<ChatResponse> {
  const body: ChatRequest = { message };
  if (previousInteractionId) {
    body.previous_interaction_id = previousInteractionId;
  }
  if (conversationId) {
    body.conversation_id = conversationId;
  }

  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ChatError(
      'Cannot reach the JARVIS backend. Make sure the FastAPI server is running on http://127.0.0.1:8000.',
      0
    );
  }

  if (response.ok) {
    return (await response.json()) as ChatResponse;
  }

  let detail = '';
  try {
    const errBody = (await response.json()) as ApiErrorBody;
    detail = errBody.detail ?? '';
  } catch {
    // Non-JSON response
  }

  switch (response.status) {
    case 422:
      throw new ChatError(
        detail || 'Your message could not be processed. Please check and try again.',
        422
      );
    case 429:
      throw new ChatError(
        detail || '⚠️ JARVIS is receiving too many requests. Please wait a moment and try again.',
        429
      );
    case 502:
      throw new ChatError(
        detail || "⚠️ JARVIS's AI service returned an error. Please try again.",
        502
      );
    case 503:
      throw new ChatError(
        detail || '⚠️ JARVIS is not fully configured yet. Check the backend setup.',
        503
      );
    case 504:
      throw new ChatError(
        detail || '⚠️ JARVIS took too long to respond. Check your connection and try again.',
        504
      );
    default:
      throw new ChatError(
        detail || `⚠️ Unexpected error (HTTP ${response.status}). Please try again.`,
        response.status
      );
  }
}

/** Fetch live backend status telemetry */
export async function fetchStatus(): Promise<BackendStatus> {
  const res = await fetch(`${BACKEND_URL}/api/status`);
  if (!res.ok) throw new ChatError('Failed to fetch system status', res.status);
  return (await res.json()) as BackendStatus;
}

/** Fetch live backend health telemetry */
export async function fetchHealth(): Promise<HealthStatus> {
  const res = await fetch(`${BACKEND_URL}/api/health`);
  if (!res.ok) throw new ChatError('Failed to fetch system health', res.status);
  return (await res.json()) as HealthStatus;
}

/** Fetch real hardware metrics via psutil */
export async function fetchSystemMetrics(): Promise<SystemMetrics> {
  const res = await fetch(`${BACKEND_URL}/api/system/metrics`);
  if (!res.ok) throw new ChatError('Failed to fetch system metrics', res.status);
  return (await res.json()) as SystemMetrics;
}

/** Retrieve stored long-term memories */
export async function fetchMemories(category?: string): Promise<MemoryItem[]> {
  const url = category
    ? `${BACKEND_URL}/api/memories?category=${encodeURIComponent(category)}`
    : `${BACKEND_URL}/api/memories`;
  const res = await fetch(url);
  if (!res.ok) throw new ChatError('Failed to fetch memories', res.status);
  return (await res.json()) as MemoryItem[];
}

/** Search stored memories by keyword query */
export async function searchMemories(query: string): Promise<MemoryItem[]> {
  const url = `${BACKEND_URL}/api/memories/search?q=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  if (!res.ok) throw new ChatError('Failed to search memories', res.status);
  return (await res.json()) as MemoryItem[];
}

/** Create an approved long-term memory */
export async function createMemory(
  content: string,
  category: 'preference' | 'project' | 'goal' | 'fact' | 'other' = 'fact',
  isApproved: boolean = true
): Promise<MemoryItem> {
  const res = await fetch(`${BACKEND_URL}/api/memories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, category, is_approved: isApproved }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to create memory' }));
    throw new ChatError(err.detail || 'Failed to create memory', res.status);
  }
  return (await res.json()) as MemoryItem;
}

/** Delete an individual memory */
export async function deleteMemory(memoryId: string): Promise<boolean> {
  const res = await fetch(`${BACKEND_URL}/api/memories/${encodeURIComponent(memoryId)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new ChatError('Failed to delete memory', res.status);
  return true;
}

/** List all local conversations */
export async function fetchConversations(): Promise<ConversationItem[]> {
  const res = await fetch(`${BACKEND_URL}/api/conversations`);
  if (!res.ok) throw new ChatError('Failed to fetch conversations', res.status);
  return (await res.json()) as ConversationItem[];
}

/** Clear all conversation history (requires explicit user confirmation) */
export async function clearAllConversations(confirmed: boolean = true): Promise<number> {
  const res = await fetch(`${BACKEND_URL}/api/conversations/clear`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ confirmed }),
  });
  if (!res.ok) throw new ChatError('Failed to clear conversation history', res.status);
  const data = await res.json();
  return data.deleted_conversations ?? 0;
}
