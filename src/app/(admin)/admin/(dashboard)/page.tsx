import { createClient } from "@/lib/supabase/server";
import { getReservationsByDateRange } from "@/lib/supabase/reservations";
import { getEvents } from "@/lib/supabase/events";
import { DashboardClient } from "@/components/admin/dashboard-client";

function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

function dayLabel(d: Date): string {
  return d.toLocaleDateString("fr-FR", { weekday: "short" }).replace(".", "");
}

export default async function AdminDashboard() {
  const supabase = await createClient();

  const now = new Date();
  const today = toDateStr(now);

  // Current week: Mon→Sun containing today
  const dayOfWeek = now.getDay(); // 0=Sun
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  // Previous week
  const prevMonday = new Date(monday);
  prevMonday.setDate(monday.getDate() - 7);
  const prevSunday = new Date(sunday);
  prevSunday.setDate(sunday.getDate() - 7);

  const [weekReservations, prevWeekReservations, allEvents] = await Promise.all([
    getReservationsByDateRange(supabase, toDateStr(monday), toDateStr(sunday)),
    getReservationsByDateRange(supabase, toDateStr(prevMonday), toDateStr(prevSunday)),
    getEvents(supabase),
  ]);

  // Stats
  const todayCount = weekReservations.filter((r) => r.date === today).length;
  const weekCount = weekReservations.length;
  const pendingCount = weekReservations.filter((r) => r.status === "pending").length;
  const confirmedCount = weekReservations.filter((r) => r.status === "confirmed").length;
  const confirmRate = weekCount > 0 ? Math.round((confirmedCount / weekCount) * 100) : 0;

  // Upcoming reservations (today or future, not cancelled, max 5)
  const upcoming = weekReservations
    .filter((r) => r.date >= today && r.status !== "cancelled")
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    .slice(0, 5);

  // Upcoming events (future, max 3)
  const upcomingEvents = allEvents
    .filter((e) => e.event_date >= today)
    .sort((a, b) => a.event_date.localeCompare(b.event_date))
    .slice(0, 3);

  // 7-day chart
  const weekChart = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = toDateStr(d);
    const prevD = new Date(prevMonday);
    prevD.setDate(prevMonday.getDate() + i);
    const prevDateStr = toDateStr(prevD);

    return {
      date: dateStr,
      label: dayLabel(d),
      count: weekReservations.filter((r) => r.date === dateStr).length,
      prevCount: prevWeekReservations.filter((r) => r.date === prevDateStr).length,
    };
  });

  return (
    <div>
      <h1 className="text-2xl font-light tracking-wide text-[#f5f0eb]">
        Tableau de bord
      </h1>
      <p className="mt-1 text-sm text-[#f5f0eb]/50">
        {new Date().toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>
      <div className="mt-6">
        <DashboardClient
          stats={{ today: todayCount, week: weekCount, pending: pendingCount, confirmRate }}
          upcoming={upcoming}
          events={upcomingEvents}
          weekChart={weekChart}
        />
      </div>
    </div>
  );
}
