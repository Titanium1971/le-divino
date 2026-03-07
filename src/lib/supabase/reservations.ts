import { SupabaseClient } from "@supabase/supabase-js";
import type { Reservation, ReservationStatus } from "@/lib/types/database";

export async function getReservations(
  supabase: SupabaseClient,
  filters?: { date?: string; status?: ReservationStatus },
): Promise<Reservation[]> {
  let query = supabase.from("reservations").select("*");

  if (filters?.date) {
    query = query.eq("date", filters.date);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query.order("date").order("time");

  if (error) throw error;
  return (data ?? []) as Reservation[];
}

export async function getReservationsByDateRange(
  supabase: SupabaseClient,
  startDate: string,
  endDate: string,
): Promise<Reservation[]> {
  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date")
    .order("time");

  if (error) throw error;
  return (data ?? []) as Reservation[];
}

export async function getTodayReservationsCount(
  supabase: SupabaseClient,
): Promise<number> {
  const today = new Date().toISOString().split("T")[0];
  const { count, error } = await supabase
    .from("reservations")
    .select("*", { count: "exact", head: true })
    .eq("date", today);

  if (error) throw error;
  return count ?? 0;
}

export async function createReservation(
  supabase: SupabaseClient,
  data: {
    name: string;
    email?: string;
    phone?: string;
    date: string;
    time: string;
    guests: number;
    message?: string;
    status?: ReservationStatus;
  },
): Promise<Reservation> {
  const { data: row, error } = await supabase
    .from("reservations")
    .insert({
      name: data.name,
      email: data.email ?? "",
      phone: data.phone ?? "",
      date: data.date,
      time: data.time,
      guests: data.guests,
      message: data.message ?? null,
      status: data.status ?? "pending",
    })
    .select()
    .single();

  if (error) throw error;
  return row as Reservation;
}

export async function updateReservationStatus(
  supabase: SupabaseClient,
  id: string,
  status: ReservationStatus,
): Promise<Reservation> {
  const { data, error } = await supabase
    .from("reservations")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Reservation;
}

export async function updateReservationNotes(
  supabase: SupabaseClient,
  id: string,
  notes: string,
): Promise<Reservation> {
  const { data, error } = await supabase
    .from("reservations")
    .update({ notes })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Reservation;
}
