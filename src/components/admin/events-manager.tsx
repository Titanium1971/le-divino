"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { getEvents, deleteEvent, deleteEventImage, getEventImageUrl } from "@/lib/supabase/events";
import type { Event, EventType } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
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
import { EventFormSheet } from "./event-form-sheet";

const TYPE_CONFIG: Record<EventType, { label: string; className: string }> = {
  karaoke:   { label: "Karaoké",       className: "bg-purple-100 text-purple-700 border-purple-200" },
  concert:   { label: "Concert",       className: "bg-blue-100 text-blue-700 border-blue-200" },
  private:   { label: "Soirée privée", className: "bg-amber-100 text-amber-700 border-amber-200" },
  holiday:   { label: "Jour férié",    className: "bg-red-100 text-red-700 border-red-200" },
  animation: { label: "Animation",     className: "bg-green-100 text-green-700 border-green-200" },
  custom:    { label: "Autre",         className: "bg-gray-100 text-gray-500 border-gray-200" },
};

type Props = {
  initialEvents: Event[];
};

function isPast(event: Event): boolean {
  const today = new Date().toISOString().split("T")[0];
  return event.event_date < today;
}

export function EventsManager({ initialEvents }: Props) {
  const supabase = createClient();
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null);
  const [deleting, setDeleting] = useState(false);

  const refresh = useCallback(async () => {
    const data = await getEvents(supabase);
    setEvents(data);
  }, [supabase]);

  function handleAdd() {
    setEditingEvent(null);
    setSheetOpen(true);
  }

  function handleEdit(event: Event) {
    setEditingEvent(event);
    setSheetOpen(true);
  }

  async function handleToggleActive(event: Event) {
    await supabase
      .from("events")
      .update({ is_active: !event.is_active })
      .eq("id", event.id);
    await refresh();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.image_path) {
        await deleteEventImage(supabase, deleteTarget.image_path);
      }
      await deleteEvent(supabase, deleteTarget.id);
      await refresh();
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-light tracking-wide sm:text-2xl">Gestion des événements</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {events.length} événement{events.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={handleAdd} className="w-full sm:w-auto">+ Ajouter un événement</Button>
      </div>

      <Separator className="my-6" />

      {/* Event list */}
      {events.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Aucun événement pour le moment.
        </p>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <EventRow
              key={event.id}
              event={event}
              onEdit={() => handleEdit(event)}
              onDelete={() => setDeleteTarget(event)}
              onToggle={() => handleToggleActive(event)}
              getImageUrl={(path) => getEventImageUrl(supabase, path)}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Sheet */}
      <EventFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        event={editingEvent}
        onSaved={async () => {
          setSheetOpen(false);
          await refresh();
        }}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet événement ?</AlertDialogTitle>
            <AlertDialogDescription>
              «&nbsp;{deleteTarget?.title?.fr}&nbsp;» sera supprimé définitivement. Cette action est
              irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Event row component ──

type EventRowProps = {
  event: Event;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  getImageUrl: (path: string) => string;
};

function EventRow({ event, onEdit, onDelete, onToggle, getImageUrl }: EventRowProps) {
  const typeConfig = TYPE_CONFIG[event.event_type];
  const past = isPast(event);
  const dateFormatted = new Date(event.event_date + "T00:00:00").toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div
      className={`rounded-lg border p-3 transition-colors ${
        past ? "opacity-50" : ""
      } ${!event.is_active && !past ? "opacity-50" : ""}`}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Thumbnail */}
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
          {event.image_path && (
            <Image
              src={getImageUrl(event.image_path)}
              alt={event.title.fr}
              fill
              className="object-cover"
              sizes="48px"
            />
          )}
        </div>

        {/* Date */}
        <div className="shrink-0">
          <p className="text-sm font-medium">{dateFormatted}</p>
          <p className="text-xs text-muted-foreground">
            {event.event_time} – {event.end_time}
          </p>
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1">
            <p className="truncate text-sm font-medium">{event.title.fr}</p>
            <Badge variant="outline" className={`shrink-0 text-[10px] ${typeConfig.className}`}>
              {typeConfig.label}
            </Badge>
          </div>
          <p className="truncate text-xs text-muted-foreground">{event.description?.fr}</p>
        </div>

        {/* Active toggle */}
        <Switch checked={event.is_active} onCheckedChange={onToggle} aria-label="Actif" />
      </div>

      {/* Actions */}
      <div className="mt-2 flex flex-wrap gap-1 sm:mt-0 sm:justify-end">
        <Button variant="ghost" size="sm" onClick={onEdit}>
          Modifier
        </Button>
        <Button variant="ghost" size="sm" className="text-destructive" onClick={onDelete}>
          Supprimer
        </Button>
      </div>
    </div>
  );
}
