export const revalidate = 0; // Admin pages must be dynamic, no caching

import { createClient } from "@/lib/supabase/server";
import { getReservationsByDateRange } from "@/lib/supabase/reservations";
import { getEvents } from "@/lib/supabase/events";
import { DashboardClient } from "@/components/admin/dashboard-client";

function toDateStr(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
  const todayReservations = weekReservations.filter((r) => r.date === today);
  const todayCount = todayReservations.length;
  const todayPending = todayReservations.filter((r) => r.status === "pending").length;
  const todayConfirmed = todayReservations.filter((r) => r.status === "confirmed").length;
  const todayGuests = todayReservations
    .filter((r) => r.status !== "cancelled")
    .reduce((sum, r) => sum + (r.guests || 0), 0);
  const weekCount = weekReservations.length;
  const prevWeekCount = prevWeekReservations.length;
  const weekTrend = prevWeekCount > 0 ? Math.round(((weekCount - prevWeekCount) / prevWeekCount) * 100) : 0;
  const pendingCount = weekReservations.filter((r) => r.status === "pending").length;
  const confirmedCount = weekReservations.filter((r) => r.status === "confirmed").length;
  const cancelledCount = weekReservations.filter((r) => r.status === "cancelled").length;
  const noShowCount = weekReservations.filter((r) => r.status === "no_show").length;
  const confirmRate = weekCount > 0 ? Math.round((confirmedCount / weekCount) * 100) : 0;
  const cancelRate = weekCount > 0 ? Math.round((cancelledCount / weekCount) * 100) : 0;
  const weekGuests = weekReservations
    .filter((r) => r.status !== "cancelled")
    .reduce((sum, r) => sum + (r.guests || 0), 0);
  const avgGuestsPerReservation = weekCount > 0 ? (weekGuests / weekCount).toFixed(1) : "0";

  // Lunch vs Dinner split
  const weekLunch = weekReservations.filter((r) => r.time < "15:00").length;
  const weekDinner = weekReservations.filter((r) => r.time >= "15:00").length;

  // Peak time slots this week
  const timeSlotCounts: Record<string, number> = {};
  weekReservations.forEach((r) => {
    timeSlotCounts[r.time] = (timeSlotCounts[r.time] || 0) + 1;
  });
  const peakSlot = Object.entries(timeSlotCounts).sort((a, b) => b[1] - a[1])[0];

  // Tomorrow's reservations
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const tomorrowStr = toDateStr(tomorrow);
  const tomorrowReservations = weekReservations.filter((r) => r.date === tomorrowStr);
  const tomorrowCount = tomorrowReservations.length;
  const tomorrowGuests = tomorrowReservations
    .filter((r) => r.status !== "cancelled")
    .reduce((sum, r) => sum + (r.guests || 0), 0);

  // Today's upcoming reservations (not cancelled, sorted by time)
  const todayUpcoming = todayReservations
    .filter((r) => r.status !== "cancelled")
    .sort((a, b) => a.time.localeCompare(b.time));

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
      <h1 className="text-2xl font-semibold tracking-wide text-[#2D1219]">
        Tableau de bord
      </h1>
      <p className="mt-1 text-sm text-[#8C7B72]">
        {new Date().toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>
      <div className="mt-6">
        <DashboardClient
          stats={{
            today: todayCount, todayPending, todayConfirmed, todayGuests,
            week: weekCount, weekTrend, weekGuests, avgGuestsPerReservation,
            pending: pendingCount, confirmRate, cancelRate, noShowCount,
            weekLunch, weekDinner,
            peakSlot: peakSlot ? { time: peakSlot[0], count: peakSlot[1] } : null,
            tomorrow: tomorrowCount, tomorrowGuests,
          }}
          upcoming={upcoming}
          todayUpcoming={todayUpcoming}
          events={upcomingEvents}
          weekChart={weekChart}
        />
      </div>
    </div>
  );
}
