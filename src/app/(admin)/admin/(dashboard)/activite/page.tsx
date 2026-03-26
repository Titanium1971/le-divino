import { createClient } from "@/lib/supabase/server";
import type { ActivityLog } from "@/lib/supabase/activity-log";
import { ActivityClient } from "./activity-client";

export const revalidate = 3600;

export default async function ActivityPage() {
  const supabase = await createClient();

  const { data: logs } = await supabase
    .from("activity_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  // Get unique users and entity types for filters
  const users = [...new Set((logs ?? []).map((l: ActivityLog) => l.user_email).filter(Boolean))] as string[];
  const entityTypes = [...new Set((logs ?? []).map((l: ActivityLog) => l.entity_type).filter(Boolean))] as string[];

  return <ActivityClient logs={(logs ?? []) as ActivityLog[]} users={users} entityTypes={entityTypes} />;
}
