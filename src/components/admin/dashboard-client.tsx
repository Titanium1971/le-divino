"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { updateReservationStatus } from "@/lib/supabase/reservations";
import { updateEvent } from "@/lib/supabase/events";
import type { Reservation, Event, EventType } from "@/lib/types/database";

// ── Types ──

type Stats = {
  today: number;
  week: number;
  pending: number;
  confirmRate: number;
};

type DayCount = {
  date: string;
  label: string;
  count: number;
  prevCount: number;
};

type Props = {
  stats: Stats;
  upcoming: Reservation[];
  events: Event[];
  weekChart: DayCount[];
};

// ── Helpers ──

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-orange-100 text-orange-700 border border-orange-200",
  confirmed: "bg-green-100 text-green-700 border border-green-200",
  cancelled: "bg-red-100 text-red-700 border border-red-200",
  completed: "bg-gray-100 text-gray-500 border border-gray-200",
  no_show: "bg-slate-100 text-slate-500 border border-slate-200",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmé",
  cancelled: "Annulé",
  completed: "Terminé",
  no_show: "No-show",
};

const EVENT_TYPE_STYLE: Record<EventType, string> = {
  karaoke: "bg-purple-100 text-purple-700 border border-purple-200",
  concert: "bg-blue-100 text-blue-700 border border-blue-200",
  private: "bg-amber-100 text-amber-700 border border-amber-200",
  holiday: "bg-red-100 text-red-700 border border-red-200",
  animation: "bg-green-100 text-green-700 border border-green-200",
  custom: "bg-gray-100 text-gray-500 border border-gray-200",
};

const EVENT_TYPE_LABEL: Record<EventType, string> = {
  karaoke: "Karaoké",
  concert: "Concert",
  private: "Soirée privée",
  holiday: "Jour férié",
  animation: "Animation",
  custom: "Autre",
};

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

// ── Component ──

export function DashboardClient({ stats, upcoming, events, weekChart }: Props) {
  const [reservations, setReservations] = useState(upcoming);
  const [eventList, setEventList] = useState(events);
  const [currentStats, setCurrentStats] = useState(stats);
  const supabase = createClient();

  async function handleConfirm(id: string) {
    await updateReservationStatus(supabase, id, "confirmed");
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "confirmed" as const } : r)),
    );
    setCurrentStats((s) => ({
      ...s,
      pending: Math.max(0, s.pending - 1),
      confirmRate: s.week > 0 ? Math.round(((s.week - s.pending + 1) / s.week) * 100) : 0,
    }));
  }

  async function handleToggleEvent(id: string, active: boolean) {
    await updateEvent(supabase, id, { is_active: active });
    setEventList((prev) =>
      prev.map((e) => (e.id === id ? { ...e, is_active: active } : e)),
    );
  }

  const maxChart = Math.max(...weekChart.map((d) => Math.max(d.count, d.prevCount)), 1);

  return (
    <div className="space-y-8">
      {/* ── Stat cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="admin-fade-up admin-fade-up-1">
          <StatCard label="Aujourd'hui" value={currentStats.today} icon="📅" accent={false} />
        </div>
        <div className="admin-fade-up admin-fade-up-2">
          <StatCard label="Cette semaine" value={currentStats.week} icon="📊" accent={false} />
        </div>
        <div className="admin-fade-up admin-fade-up-3">
          <StatCard label="En attente" value={currentStats.pending} icon="⏳" accent={currentStats.pending > 0} />
        </div>
        <div className="admin-fade-up admin-fade-up-4">
          <StatCard label="Taux confirmation" value={`${currentStats.confirmRate}%`} icon="✓" accent={false} />
        </div>
      </div>

      {/* ── Central 2-col ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming reservations */}
        <div className="admin-card admin-fade-up p-6" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium tracking-wide text-[#2D1219]">
              Prochaines réservations
            </h2>
            <Link
              href="/admin/reservations"
              className="admin-focus rounded-sm text-xs font-medium text-[#C5A55A] transition-colors duration-150 hover:text-[#d4b368] hover:underline"
            >
              Voir tout →
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {reservations.length === 0 ? (
              <p className="text-sm text-[#8C7B72]">Aucune réservation à venir</p>
            ) : (
              reservations.map((r) => (
                <div
                  key={r.id}
                  className="admin-slide-in flex items-center gap-3 rounded-lg border border-[#E8DDD4] bg-white px-4 py-3 transition-all duration-200 hover:bg-[#FDF8F3]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#C5A55A]">
                        {r.time}
                      </span>
                      <span className="truncate text-sm font-medium text-[#2D1219]">
                        {r.name}
                      </span>
                      <span className="text-xs text-[#8C7B72]">
                        {r.guests} pers.
                      </span>
                    </div>
                    <span className="text-[10px] text-[#8C7B72]">
                      {formatDate(r.date)}
                    </span>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLE[r.status]} ${
                      r.status === "pending" ? "admin-pending-pulse" : ""
                    }`}
                  >
                    {STATUS_LABEL[r.status]}
                  </span>
                  {r.status === "pending" && (
                    <button
                      onClick={() => handleConfirm(r.id)}
                      className="admin-btn admin-btn-primary admin-focus rounded-md px-2.5 py-1 text-[10px]"
                    >
                      Confirmer
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming events */}
        <div className="admin-card admin-fade-up p-6" style={{ animationDelay: "250ms" }}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium tracking-wide text-[#2D1219]">
              Prochains événements
            </h2>
            <Link
              href="/admin/events"
              className="admin-focus rounded-sm text-xs font-medium text-[#C5A55A] transition-colors duration-150 hover:text-[#d4b368] hover:underline"
            >
              Voir tout →
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {eventList.length === 0 ? (
              <p className="text-sm text-[#8C7B72]">Aucun événement à venir</p>
            ) : (
              eventList.map((ev) => (
                <div
                  key={ev.id}
                  className="admin-slide-in flex items-center gap-3 rounded-lg border border-[#E8DDD4] bg-white px-4 py-3 transition-all duration-200 hover:bg-[#FDF8F3]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#C5A55A]">
                        {formatDate(ev.event_date)}
                      </span>
                      <span className="truncate text-sm font-medium text-[#2D1219]">
                        {ev.title.fr}
                      </span>
                    </div>
                    {ev.event_time && (
                      <span className="text-[10px] text-[#8C7B72]">
                        {ev.event_time}
                      </span>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${EVENT_TYPE_STYLE[ev.event_type]}`}
                  >
                    {EVENT_TYPE_LABEL[ev.event_type]}
                  </span>
                  <button
                    onClick={() => handleToggleEvent(ev.id, !ev.is_active)}
                    className={`admin-focus relative h-5 w-9 rounded-full transition-colors duration-150 ${
                      ev.is_active ? "bg-[#C5A55A]" : "bg-[#E8DDD4]"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-150 ${
                        ev.is_active ? "left-[18px]" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── 7-day chart ── */}
      <div className="admin-card admin-fade-up p-6" style={{ animationDelay: "300ms" }}>
        <h2 className="text-sm font-medium tracking-wide text-[#2D1219]">
          Réservations — 7 derniers jours
        </h2>
        <div className="mt-6 flex items-end gap-2">
          {weekChart.map((d, i) => (
            <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex w-full items-end justify-center gap-0.5" style={{ height: 120 }}>
                {/* Previous week bar */}
                <div
                  className={`admin-bar-grow admin-bar-grow-${i + 1} w-3 rounded-t bg-[#E8DDD4] transition-all`}
                  style={{ height: `${(d.prevCount / maxChart) * 100}%`, minHeight: 2 }}
                  title={`Sem. précédente: ${d.prevCount}`}
                />
                {/* Current week bar */}
                <div
                  className={`admin-bar-grow admin-bar-grow-${i + 1} w-3 rounded-t bg-[#C5A55A] transition-all`}
                  style={{ height: `${(d.count / maxChart) * 100}%`, minHeight: 2 }}
                  title={`${d.count} réservation${d.count > 1 ? "s" : ""}`}
                />
              </div>
              <span className="text-[10px] text-[#8C7B72]">{d.label}</span>
              <span className="text-xs font-medium text-[#2D1219]">{d.count}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-4 text-[10px] text-[#8C7B72]">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-sm bg-[#C5A55A]" /> Cette semaine
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-sm bg-[#E8DDD4]" /> Semaine précédente
          </span>
        </div>
      </div>

      {/* ── Quick actions + Google ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="admin-fade-up" style={{ animationDelay: "350ms" }}>
          <QuickAction href="/admin/reservations" label="Nouvelle réservation" icon="◉" />
        </div>
        <div className="admin-fade-up" style={{ animationDelay: "400ms" }}>
          <QuickAction href="/admin/menu" label="Nouveau plat" icon="◇" />
        </div>
        <div className="admin-fade-up" style={{ animationDelay: "450ms" }}>
          <QuickAction href="/admin/events" label="Nouvel événement" icon="◎" />
        </div>
        <div className="admin-fade-up" style={{ animationDelay: "500ms" }}>
          <QuickAction href="/" label="Voir le site" icon="↗" external />
        </div>

        {/* Google rating widget */}
        <div className="admin-fade-up" style={{ animationDelay: "550ms" }}>
          <div className="admin-card admin-card-hoverable flex h-full flex-col items-center justify-center gap-2 p-4">
            <div className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-lg font-semibold text-[#2D1219]">4.9</span>
              <span className="text-xs text-[#8C7B72]">/5</span>
            </div>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <svg key={s} viewBox="0 0 24 24" fill="#C5A55A" className="h-3.5 w-3.5">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <span className="text-[10px] text-[#8C7B72]">76 avis Google</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ──

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number | string;
  icon: string;
  accent: boolean;
}) {
  return (
    <div
      className={`p-5 ${
        accent
          ? "admin-card-accent"
          : "admin-card admin-card-hoverable"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium tracking-wide text-[#8C7B72] uppercase">
          {label}
        </span>
        <span className="text-base">{icon}</span>
      </div>
      <p
        className={`mt-2 text-3xl font-light tracking-tight ${
          accent ? "text-orange-600" : "text-[#2D1219]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function QuickAction({
  href,
  label,
  icon,
  external,
}: {
  href: string;
  label: string;
  icon: string;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      {...(external ? { target: "_blank" } : {})}
      className="admin-card admin-focus flex h-full flex-col items-center gap-2 p-4 transition-all duration-200 hover:border-[#C5A55A]/30 hover:bg-[#FDF8F3] hover:-translate-y-0.5"
    >
      <span className="text-xl text-[#6B1A2A]">{icon}</span>
      <span className="text-center text-xs font-medium text-[#8C7B72]">{label}</span>
    </Link>
  );
}
