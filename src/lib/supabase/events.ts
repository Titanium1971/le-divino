import { SupabaseClient } from "@supabase/supabase-js";
import type { Event, EventFormData } from "@/lib/types/database";

export async function getEvents(supabase: SupabaseClient): Promise<Event[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("event_date");

  if (error) throw error;
  return (data ?? []) as Event[];
}

export async function getUpcomingEvents(supabase: SupabaseClient): Promise<Event[]> {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"

  // Fetch today + future events
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("is_active", true)
    .gte("event_date", today)
    .order("event_date")
    .order("event_time");

  if (error) throw error;

  // Filter out today's events whose end_time has passed
  const filtered = (data ?? []).filter((event) => {
    if (event.event_date !== today) return true;
    // If the event is today, check end_time (or event_time as fallback)
    const endTime = event.end_time || event.event_time;
    if (!endTime) return true;
    return endTime > currentTime;
  });

  return filtered as Event[];
}

export async function createEvent(
  supabase: SupabaseClient,
  data: EventFormData,
): Promise<Event> {
  const { data: event, error } = await supabase
    .from("events")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return event as Event;
}

export async function updateEvent(
  supabase: SupabaseClient,
  id: string,
  data: Partial<EventFormData> & { image_path?: string | null },
): Promise<Event> {
  const { data: event, error } = await supabase
    .from("events")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return event as Event;
}

export async function deleteEvent(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadEventImage(
  supabase: SupabaseClient,
  file: File,
  eventId: string,
): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `${eventId}.${ext}`;

  const { error } = await supabase.storage.from("events").upload(path, file, {
    upsert: true,
    contentType: file.type,
  });

  if (error) throw error;
  return path;
}

export async function deleteEventImage(
  supabase: SupabaseClient,
  path: string,
): Promise<void> {
  const { error } = await supabase.storage.from("events").remove([path]);
  if (error) throw error;
}

export function getEventImageUrl(supabase: SupabaseClient, path: string): string {
  const { data } = supabase.storage.from("events").getPublicUrl(path);
  return data.publicUrl;
}
