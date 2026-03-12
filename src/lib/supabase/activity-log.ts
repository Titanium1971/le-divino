import { SupabaseClient } from "@supabase/supabase-js";

export type ActivityAction = "CREATE" | "UPDATE" | "DELETE";

export type ActivityEntityType =
  | "dish"
  | "menu"
  | "wine"
  | "drink"
  | "reservation"
  | "event"
  | "gallery"
  | "settings"
  | "conges";

export type ActivityLog = {
  id: string;
  user_id: string | null;
  user_email: string | null;
  user_role: string | null;
  action: ActivityAction;
  entity_type: ActivityEntityType;
  entity_id: string | null;
  entity_name: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
};

/**
 * Log an activity. Fire-and-forget — never throws.
 */
export async function logActivity(
  supabase: SupabaseClient,
  params: {
    action: ActivityAction;
    entityType: ActivityEntityType;
    entityId?: string;
    entityName?: string;
    details?: Record<string, unknown>;
  },
): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("activity_logs").insert({
      user_id: user?.id ?? null,
      user_email: user?.email ?? null,
      user_role: null, // Could be enriched from profiles table later
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId ?? null,
      entity_name: params.entityName ?? null,
      details: params.details ?? null,
    });
  } catch {
    // Silent fail — logging should never break the app
  }
}
