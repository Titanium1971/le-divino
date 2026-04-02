import { SupabaseClient } from "@supabase/supabase-js";
import type { ChatClient, ChatConversation } from "@/lib/types/chat";

export async function getOrCreateClient(
  supabase: SupabaseClient,
  email: string,
  name?: string,
  locale?: string,
): Promise<ChatClient> {
  // Try to find existing client
  const { data: existing } = await supabase
    .from("chat_clients")
    .select("*")
    .eq("email", email)
    .single();

  if (existing) {
    // Update name if it was missing and now provided
    if (name && !existing.name) {
      await supabase
        .from("chat_clients")
        .update({ name })
        .eq("id", existing.id);
      existing.name = name;
    }
    return existing as ChatClient;
  }

  // Create new client
  const { data: created, error } = await supabase
    .from("chat_clients")
    .insert({
      email,
      name: name || null,
      preferred_language: locale || "fr",
      gdpr_consent: true,
      gdpr_consent_date: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return created as ChatClient;
}

export async function updateClientPreferences(
  supabase: SupabaseClient,
  email: string,
  updates: {
    name?: string;
    allergies?: string[];
    dietary_preferences?: string[];
    taste_notes?: string;
    favorite_dishes?: string[];
    favorite_wines?: string[];
  },
): Promise<void> {
  const { error } = await supabase
    .from("chat_clients")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("email", email);

  if (error) throw error;
}

export async function getOrCreateConversation(
  supabase: SupabaseClient,
  sessionId: string,
  locale: string,
  clientId?: string,
): Promise<ChatConversation> {
  // Try to find existing conversation for this session
  const { data: existing } = await supabase
    .from("chat_conversations")
    .select("*")
    .eq("session_id", sessionId)
    .is("ended_at", null)
    .order("started_at", { ascending: false })
    .limit(1)
    .single();

  if (existing) {
    // Link client if newly identified
    if (clientId && !existing.client_id) {
      await supabase
        .from("chat_conversations")
        .update({ client_id: clientId })
        .eq("id", existing.id);
      existing.client_id = clientId;
    }
    return existing as ChatConversation;
  }

  // Create new conversation
  const { data: created, error } = await supabase
    .from("chat_conversations")
    .insert({
      session_id: sessionId,
      locale,
      client_id: clientId || null,
    })
    .select()
    .single();

  if (error) throw error;
  return created as ChatConversation;
}

export async function saveMessage(
  supabase: SupabaseClient,
  conversationId: string,
  role: "user" | "assistant" | "system" | "tool",
  content: string,
  toolCalls?: unknown,
  toolResults?: unknown,
): Promise<void> {
  const { error } = await supabase.from("chat_messages").insert({
    conversation_id: conversationId,
    role,
    content,
    tool_calls: toolCalls || null,
    tool_results: toolResults || null,
  });

  if (error) throw error;

  // Increment message count manually
  const { data: conv } = await supabase
    .from("chat_conversations")
    .select("message_count")
    .eq("id", conversationId)
    .single();

  if (conv) {
    await supabase
      .from("chat_conversations")
      .update({ message_count: (conv.message_count || 0) + 1 })
      .eq("id", conversationId);
  }
}

export async function getConversationHistory(
  supabase: SupabaseClient,
  conversationId: string,
  limit = 30,
): Promise<{ role: string; content: string }[]> {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .in("role", ["user", "assistant"])
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as { role: string; content: string }[];
}

export async function getClientReservations(
  supabase: SupabaseClient,
  email: string,
  limit = 5,
): Promise<{ date: string; time: string; guests: number; status: string }[]> {
  const { data, error } = await supabase
    .from("reservations")
    .select("date, time, guests, status")
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return data ?? [];
}
