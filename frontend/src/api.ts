import { BackendStatus, HealthStatus, SystemMetrics } from "./types";

/**
 * JARVIS — Backend API client  (Phase 2)
 *
 * This is the ONLY file allowed to make network calls to the FastAPI backend.
 * Keep all fetch() logic here so App.tsx stays focused on UI.
 *
 * Security rules (enforced by design):
 *   - No Gemini API key is present, referenced, or requested anywhere in
 *     this file or any other frontend file.
 *   - The frontend only knows the backend URL below.
 *   - The backend handles all AI communication and keeps the key server-side.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Configuration — uses Vite dev-server proxy in browser to guarantee zero CORS/PNA blocks.
// ─────────────────────────────────────────────────────────────────────────────

const BACKEND_URL =
  typeof window !== "undefined"
    ? "" // Same-origin relative path proxied to http://127.0.0.1:8000
    : "http://127.0.0.1:8000";

// ─────────────────────────────────────────────────────────────────────────────
// TypeScript types
// ─────────────────────────────────────────────────────────────────────────────

/** Shape of the JSON body we send to POST /api/chat */
interface ChatRequest {
  message: string;
  previous_interaction_id?: string;
  conversation_id?: string;
}

/** Shape of the JSON body we receive on HTTP 200 */
export interface ChatResponse {
  reply: string;
  interaction_id: string | null;
  conversation_id?: string | null;
}

/** Shape of stored Long-Term Memory */
export interface MemoryItem {
  id: string;
  category: 'preference' | 'project' | 'goal' | 'fact' | 'other';
  content: string;
  source: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

/** Shape of Conversation Summary */
export interface ConversationItem {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

/** Shape of FastAPI error responses (4xx / 5xx) */
interface ApiErrorBody {
  detail: string;
}

/**
 * Typed error thrown by sendChatMessage() on any failure.
 *
 * Usage in App.tsx:
 *   catch (err) {
 *     if (err instanceof ChatError) setErrorMsg(err.message);
 *   }
 */
export class ChatError extends Error {
  /** HTTP status code (0 = network failure — no response received) */
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ChatError";
    this.status = status;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Send a message to JARVIS and get a reply.
 *
 * @param message                 The user's text (1–2000 chars).
 * @param previousInteractionId   Pass the `interaction_id` from the previous
 *                                call to continue a multi-turn conversation.
 *                                Omit (or pass undefined) to start fresh.
 *
 * @returns  { reply, interaction_id }
 *           Save `interaction_id` and pass it on the next call so JARVIS
 *           remembers the conversation context.
 *
 * @throws   ChatError  with a user-friendly `.message` on any failure:
 *                        - Network down          (status 0)
 *                        - Validation error      (status 422)
 *                        - Rate limited          (status 429)
 *                        - Backend/AI error      (status 502 / 503 / 504)
 *                        - Unexpected error      (status 500)
 */
export async function sendChatMessage(
  message: string,
  previousInteractionId?: string,
  conversationId?: string
): Promise<ChatResponse> {
  // Build request body — include optional IDs when provided.
  const body: ChatRequest = { message };
  if (previousInteractionId) {
    body.previous_interaction_id = previousInteractionId;
  }
  if (conversationId) {
    body.conversation_id = conversationId;
  }

  // ── Network call ──────────────────────────────────────────────────────────
  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    // fetch() itself throws only on a true network failure
    // (backend not running, DNS error, CORS blocked before response, etc.)
    throw new ChatError(
      "Cannot reach the JARVIS backend. Make sure the backend server is running.",
      0
    );
  }

  // ── Happy path ────────────────────────────────────────────────────────────
  if (response.ok) {
    const data = (await response.json()) as ChatResponse;
    return data;
  }

  // ── Error path — map status codes to friendly messages ───────────────────
  // Try to read FastAPI's { "detail": "..." } body for extra context.
  let detail = "";
  try {
    const errBody = (await response.json()) as ApiErrorBody;
    detail = errBody.detail ?? "";
  } catch {
    // Response body wasn't JSON — ignore and fall through to defaults.
  }

  switch (response.status) {
    case 422:
      throw new ChatError(
        detail || "Your message could not be processed. Please check and try again.",
        422
      );
    case 429:
      throw new ChatError(
        detail || "⚠️ JARVIS is receiving too many requests. Please wait a moment and try again.",
        429
      );
    case 502:
      throw new ChatError(
        detail || "⚠️ JARVIS's AI service returned an error. Please try again.",
        502
      );
    case 503:
      // detail from the backend already contains the friendly config-error message
      throw new ChatError(
        detail || "⚠️ JARVIS is not fully configured yet. Check the backend setup.",
        503
      );
    case 504:
      throw new ChatError(
        detail || "⚠️ JARVIS took too long to respond. Check your connection and try again.",
        504
      );
    default:
      throw new ChatError(
        detail || `⚠️ Unexpected error (HTTP ${response.status}). Please try again.`,
        response.status
      );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Long-Term Memory & Conversation Management APIs
// ─────────────────────────────────────────────────────────────────────────────

/** Retrieve stored long-term memories. */
export async function fetchMemories(category?: string): Promise<MemoryItem[]> {
  const url = category
    ? `${BACKEND_URL}/api/memories?category=${encodeURIComponent(category)}`
    : `${BACKEND_URL}/api/memories`;
  const res = await fetch(url);
  if (!res.ok) throw new ChatError("Failed to fetch memories", res.status);
  return (await res.json()) as MemoryItem[];
}

/** Search stored memories by keyword query. */
export async function searchMemories(query: string): Promise<MemoryItem[]> {
  const url = `${BACKEND_URL}/api/memories/search?q=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  if (!res.ok) throw new ChatError("Failed to search memories", res.status);
  return (await res.json()) as MemoryItem[];
}

/** Create an approved long-term memory. */
export async function createMemory(
  content: string,
  category: 'preference' | 'project' | 'goal' | 'fact' | 'other' = 'fact',
  isApproved: boolean = true
): Promise<MemoryItem> {
  const res = await fetch(`${BACKEND_URL}/api/memories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, category, is_approved: isApproved }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to create memory" }));
    throw new ChatError(err.detail || "Failed to create memory", res.status);
  }
  return (await res.json()) as MemoryItem;
}

/** Delete an individual memory. */
export async function deleteMemory(memoryId: string): Promise<boolean> {
  const res = await fetch(`${BACKEND_URL}/api/memories/${encodeURIComponent(memoryId)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new ChatError("Failed to delete memory", res.status);
  return true;
}

/** Clear all conversation history (requires confirmation). */
export async function clearAllConversations(confirmed: boolean = true): Promise<number> {
  const res = await fetch(`${BACKEND_URL}/api/conversations/clear`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ confirmed }),
  });
  if (!res.ok) throw new ChatError("Failed to clear conversation history", res.status);
  const data = await res.json();
  return data.deleted_conversations ?? 0;
}

/** List all local conversations. */
export async function fetchConversations(): Promise<ConversationItem[]> {
  const res = await fetch(`${BACKEND_URL}/api/conversations`);
  if (!res.ok) throw new ChatError("Failed to fetch conversations", res.status);
  return (await res.json()) as ConversationItem[];
}

/** Fetch live backend status telemetry */
export async function fetchStatus(): Promise<BackendStatus> {
  const res = await fetch(`${BACKEND_URL}/api/status`);
  if (!res.ok) throw new ChatError("Failed to fetch system status", res.status);
  return (await res.json()) as BackendStatus;
}

/** Fetch live backend health telemetry */
export async function fetchHealth(): Promise<HealthStatus> {
  const res = await fetch(`${BACKEND_URL}/api/health`);
  if (!res.ok) throw new ChatError("Failed to fetch system health", res.status);
  return (await res.json()) as HealthStatus;
}

/** Fetch live real hardware metrics (CPU, RAM, Disk, Net, Processes via psutil) */
export async function fetchSystemMetrics(): Promise<SystemMetrics> {
  const res = await fetch(`${BACKEND_URL}/api/system/metrics`);
  if (!res.ok) throw new ChatError("Failed to fetch system metrics", res.status);
  return (await res.json()) as SystemMetrics;
}
