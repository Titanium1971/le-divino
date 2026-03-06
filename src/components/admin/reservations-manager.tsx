"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  getReservations,
  getReservationsByDateRange,
  updateReservationStatus,
} from "@/lib/supabase/reservations";
import type { Reservation, ReservationStatus } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ReservationDetailSheet } from "./reservation-detail-sheet";

const STATUS_CONFIG: Record<ReservationStatus, { label: string; className: string }> = {
  pending: { label: "En attente", className: "bg-orange-100 text-orange-700 border-orange-200" },
  confirmed: { label: "Confirmée", className: "bg-green-100 text-green-700 border-green-200" },
  cancelled: { label: "Annulée", className: "bg-red-100 text-red-700 border-red-200" },
  completed: { label: "Terminée", className: "bg-gray-100 text-gray-500 border-gray-200" },
  no_show: { label: "No-show", className: "bg-slate-100 text-slate-500 border-slate-200" },
};

const ALL_STATUSES: ReservationStatus[] = ["pending", "confirmed", "cancelled", "completed", "no_show"];

type Props = {
  initialReservations: Reservation[];
  todayCount: number;
};

// ── Helpers ──

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDateISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getDayNames(): string[] {
  return ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
}

export function ReservationsManager({ initialReservations, todayCount }: Props) {
  const supabase = createClient();
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [todayCountState, setTodayCountState] = useState(todayCount);

  // Filters
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Detail sheet
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Cancel dialog
  const [cancelTarget, setCancelTarget] = useState<Reservation | null>(null);

  // Calendar state
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [calendarReservations, setCalendarReservations] = useState<Reservation[]>([]);
  const [calendarLoaded, setCalendarLoaded] = useState(false);

  // ── Fetch helpers ──

  const fetchList = useCallback(
    async (date?: string, status?: string) => {
      const filters: { date?: string; status?: ReservationStatus } = {};
      if (date) filters.date = date;
      if (status && status !== "all") filters.status = status as ReservationStatus;
      const data = await getReservations(supabase, Object.keys(filters).length > 0 ? filters : undefined);
      setReservations(data);
    },
    [supabase],
  );

  const fetchCalendar = useCallback(
    async (start: Date) => {
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      const data = await getReservationsByDateRange(supabase, formatDateISO(start), formatDateISO(end));
      setCalendarReservations(data);
    },
    [supabase],
  );

  async function refresh() {
    await fetchList(filterDate, filterStatus);
    // Update today count
    const today = new Date().toISOString().split("T")[0];
    const todayRes = await getReservations(supabase, { date: today });
    setTodayCountState(todayRes.length);
    // Also refresh calendar if loaded
    if (calendarLoaded) {
      await fetchCalendar(weekStart);
    }
  }

  // ── Filter handlers ──

  async function handleDateChange(date: string) {
    setFilterDate(date);
    await fetchList(date, filterStatus);
  }

  async function handleStatusChange(status: string) {
    setFilterStatus(status);
    await fetchList(filterDate, status);
  }

  // ── Quick actions ──

  async function handleQuickConfirm(reservation: Reservation) {
    await updateReservationStatus(supabase, reservation.id, "confirmed");
    await refresh();
  }

  async function handleQuickComplete(reservation: Reservation) {
    await updateReservationStatus(supabase, reservation.id, "completed");
    await refresh();
  }

  async function handleCancelConfirm() {
    if (!cancelTarget) return;
    await updateReservationStatus(supabase, cancelTarget.id, "cancelled");
    setCancelTarget(null);
    await refresh();
  }

  // ── Detail sheet ──

  function handleRowClick(reservation: Reservation) {
    setSelectedReservation(reservation);
    setSheetOpen(true);
  }

  // ── Calendar navigation ──

  async function handleTabChange(tab: string) {
    if (tab === "calendar" && !calendarLoaded) {
      setCalendarLoaded(true);
      await fetchCalendar(weekStart);
    }
  }

  async function handlePrevWeek() {
    const newStart = new Date(weekStart);
    newStart.setDate(newStart.getDate() - 7);
    setWeekStart(newStart);
    await fetchCalendar(newStart);
  }

  async function handleNextWeek() {
    const newStart = new Date(weekStart);
    newStart.setDate(newStart.getDate() + 7);
    setWeekStart(newStart);
    await fetchCalendar(newStart);
  }

  // ── Build calendar days ──

  function getWeekDays(): Date[] {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-light tracking-wide">Gestion des réservations</h1>
          <Badge variant="secondary">{todayCountState} aujourd&apos;hui</Badge>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Filters */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Date :</span>
          <Input
            type="date"
            value={filterDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-auto"
          />
          {filterDate && (
            <Button variant="ghost" size="sm" onClick={() => handleDateChange("")}>
              Effacer
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Statut :</span>
          <Select value={filterStatus} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              {ALL_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_CONFIG[s].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="list" onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="list">Liste</TabsTrigger>
          <TabsTrigger value="calendar">Calendrier</TabsTrigger>
        </TabsList>

        {/* ── List tab ── */}
        <TabsContent value="list">
          {reservations.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Aucune réservation trouvée.
            </p>
          ) : (
            <div className="space-y-2">
              {reservations.map((r) => (
                <ReservationRow
                  key={r.id}
                  reservation={r}
                  onClick={() => handleRowClick(r)}
                  onConfirm={() => handleQuickConfirm(r)}
                  onCancel={() => setCancelTarget(r)}
                  onComplete={() => handleQuickComplete(r)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Calendar tab ── */}
        <TabsContent value="calendar">
          <div className="space-y-4">
            {/* Week navigation */}
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={handlePrevWeek}>
                ← Semaine précédente
              </Button>
              <span className="text-sm font-medium">
                {formatDateISO(weekStart)} — {formatDateISO((() => {
                  const end = new Date(weekStart);
                  end.setDate(end.getDate() + 6);
                  return end;
                })())}
              </span>
              <Button variant="outline" size="sm" onClick={handleNextWeek}>
                Semaine suivante →
              </Button>
            </div>

            {/* Week grid */}
            <div className="grid grid-cols-7 gap-2">
              {getWeekDays().map((day, i) => {
                const dayStr = formatDateISO(day);
                const dayReservations = calendarReservations.filter((r) => r.date === dayStr);
                const isToday = dayStr === new Date().toISOString().split("T")[0];

                return (
                  <div
                    key={dayStr}
                    className={`min-h-[140px] rounded-lg border p-2 ${
                      isToday ? "border-primary/40 bg-primary/5" : ""
                    }`}
                  >
                    <div className="mb-2 text-center">
                      <p className="text-xs text-muted-foreground">{getDayNames()[i]}</p>
                      <p className={`text-sm font-medium ${isToday ? "text-primary" : ""}`}>
                        {day.getDate()}
                      </p>
                    </div>
                    <div className="space-y-1">
                      {dayReservations.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => handleRowClick(r)}
                          className={`w-full rounded p-1.5 text-left text-xs transition-opacity hover:opacity-80 ${
                            STATUS_CONFIG[r.status].className
                          }`}
                        >
                          <p className="font-medium">{r.time}</p>
                          <p className="truncate">{r.name}</p>
                          <p className="text-[10px] opacity-70">{r.guests} pers.</p>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Detail sheet */}
      <ReservationDetailSheet
        reservation={selectedReservation}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onUpdated={async () => {
          // Refresh selected reservation
          const updated = reservations.find((r) => r.id === selectedReservation?.id);
          if (updated) {
            setSelectedReservation(updated);
          }
          await refresh();
          // Re-fetch to get the updated reservation for the sheet
          const freshList = await getReservations(supabase);
          const freshSelected = freshList.find((r) => r.id === selectedReservation?.id);
          if (freshSelected) {
            setSelectedReservation(freshSelected);
          }
        }}
      />

      {/* Cancel confirmation */}
      <AlertDialog open={!!cancelTarget} onOpenChange={() => setCancelTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler cette réservation ?</AlertDialogTitle>
            <AlertDialogDescription>
              La réservation de {cancelTarget?.name} pour le{" "}
              {cancelTarget && new Date(cancelTarget.date + "T00:00:00").toLocaleDateString("fr-FR")}{" "}
              à {cancelTarget?.time} sera marquée comme annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Retour</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirmer l&apos;annulation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Reservation row ──

type ReservationRowProps = {
  reservation: Reservation;
  onClick: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  onComplete: () => void;
};

function ReservationRow({ reservation, onClick, onConfirm, onCancel, onComplete }: ReservationRowProps) {
  const statusConfig = STATUS_CONFIG[reservation.status];
  const dateFormatted = new Date(reservation.date + "T00:00:00").toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });

  return (
    <div
      className="flex cursor-pointer items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-[#FDF8F3]"
      onClick={onClick}
    >
      {/* Date + time */}
      <div className="w-20 shrink-0 text-center">
        <p className="text-sm font-medium">{dateFormatted}</p>
        <p className="text-xs text-muted-foreground">{reservation.time}</p>
      </div>

      {/* Name + guests */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{reservation.name}</p>
        <p className="text-xs text-muted-foreground">
          {reservation.guests} convive{reservation.guests > 1 ? "s" : ""}
        </p>
      </div>

      {/* Status badge */}
      <Badge variant="outline" className={statusConfig.className}>
        {statusConfig.label}
      </Badge>

      {/* Quick actions */}
      <div className="flex shrink-0 gap-1" onClick={(e) => e.stopPropagation()}>
        {reservation.status === "pending" && (
          <Button variant="ghost" size="sm" onClick={onConfirm}>
            Confirmer
          </Button>
        )}
        {(reservation.status === "pending" || reservation.status === "confirmed") && (
          <Button variant="ghost" size="sm" className="text-destructive" onClick={onCancel}>
            Annuler
          </Button>
        )}
        {reservation.status === "confirmed" && (
          <Button variant="ghost" size="sm" onClick={onComplete}>
            Terminer
          </Button>
        )}
      </div>
    </div>
  );
}
