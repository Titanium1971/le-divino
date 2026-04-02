export type ChatClient = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  preferred_language: string;
  allergies: string[];
  dietary_preferences: string[];
  taste_notes: string | null;
  favorite_dishes: string[];
  favorite_wines: string[];
  visit_count: number;
  last_visit_date: string | null;
  notes: string | null;
  gdpr_consent: boolean;
  gdpr_consent_date: string | null;
  created_at: string;
  updated_at: string;
};

export type ChatConversation = {
  id: string;
  client_id: string | null;
  session_id: string;
  locale: string;
  started_at: string;
  ended_at: string | null;
  message_count: number;
  summary: string | null;
};

export type ChatMessage = {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  tool_calls: unknown | null;
  tool_results: unknown | null;
  created_at: string;
};

export type ChatRequestBody = {
  sessionId: string;
  message: string;
  locale: string;
  clientEmail?: string;
  clientName?: string;
};

export type ChatStreamEvent =
  | { type: "text"; content: string }
  | { type: "thinking" }
  | { type: "error"; content: string }
  | { type: "done" };
