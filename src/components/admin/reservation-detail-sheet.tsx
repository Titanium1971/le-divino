"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateReservationStatus, updateReservationNotes } from "@/lib/supabase/reservations";
import type { Reservation, ReservationStatus } from "@/lib/types/database";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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

const STATUS_CONFIG: Record<ReservationStatus, { label: string; className: string }> = {
  pending: { label: "En attente", className: "bg-orange-100 text-orange-700 border-orange-200" },
  confirmed: { label: "Confirmée", className: "bg-green-100 text-green-700 border-green-200" },
  cancelled: { label: "Annulée", className: "bg-red-100 text-red-700 border-red-200" },
  completed: { label: "Terminée", className: "bg-gray-100 text-gray-500 border-gray-200" },
  no_show: { label: "No-show", className: "bg-slate-100 text-slate-500 border-slate-200" },
};

type Props = {
  reservation: Reservation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => Promise<void>;
};

export function ReservationDetailSheet({ reservation, open, onOpenChange, onUpdated }: Props) {
  const supabase = createClient();
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  // Sync notes when reservation changes
  const currentNotes = reservation?.notes ?? "";
  if (open && notes !== currentNotes && !savingNotes) {
    // Only reset if we haven't started editing
  }

  function handleOpenChange(value: boolean) {
    if (value && reservation) {
      setNotes(reservation.notes ?? "");
    }
    onOpenChange(value);
  }

  async function handleSaveNotes() {
    if (!reservation) return;
    setSavingNotes(true);
    try {
      await updateReservationNotes(supabase, reservation.id, notes);
      await onUpdated();
    } finally {
      setSavingNotes(false);
    }
  }

  async function handleStatusChange(status: ReservationStatus) {
    if (!reservation) return;
    setUpdatingStatus(true);
    try {
      await updateReservationStatus(supabase, reservation.id, status);
      await onUpdated();
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handleCancel() {
    await handleStatusChange("cancelled");
    setCancelDialogOpen(false);
  }

  if (!reservation) return null;

  const statusConfig = STATUS_CONFIG[reservation.status];
  const dateFormatted = new Date(reservation.date + "T00:00:00").toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <div className="flex items-center gap-3">
              <SheetTitle>Réservation</SheetTitle>
              <Badge variant="outline" className={statusConfig.className}>
                {statusConfig.label}
              </Badge>
            </div>
            <SheetDescription>
              Détail et gestion de la réservation de {reservation.name}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-6 overflow-y-auto px-4 pb-4">
            {/* Client info */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Informations client</h3>
              <div className="grid grid-cols-2 gap-3">
                <InfoField label="Nom" value={reservation.name} />
                <InfoField label="Téléphone" value={reservation.phone} />
                <InfoField label="Email" value={reservation.email} span={2} />
              </div>
            </div>

            <Separator />

            {/* Reservation details */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Détails</h3>
              <div className="grid grid-cols-2 gap-3">
                <InfoField label="Date" value={dateFormatted} span={2} />
                <InfoField label="Heure" value={reservation.time} />
                <InfoField label="Convives" value={`${reservation.guests} personne${reservation.guests > 1 ? "s" : ""}`} />
              </div>
            </div>

            {/* Client message */}
            {reservation.message && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Message du client</h3>
                  <p className="rounded-md border bg-muted/50 p-3 text-sm">{reservation.message}</p>
                </div>
              </>
            )}

            <Separator />

            {/* Admin notes */}
            <div className="space-y-2">
              <Label htmlFor="admin-notes">Notes internes</Label>
              <Textarea
                id="admin-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes visibles uniquement par l'équipe..."
                rows={3}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveNotes}
                disabled={savingNotes || notes === (reservation.notes ?? "")}
              >
                {savingNotes ? "Enregistrement..." : "Sauvegarder les notes"}
              </Button>
            </div>
          </div>

          {/* Action buttons */}
          <SheetFooter className="border-t">
            <div className="flex w-full gap-2">
              {reservation.status === "pending" && (
                <Button
                  className="flex-1"
                  onClick={() => handleStatusChange("confirmed")}
                  disabled={updatingStatus}
                >
                  Confirmer
                </Button>
              )}
              {(reservation.status === "pending" || reservation.status === "confirmed") && (
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => setCancelDialogOpen(true)}
                  disabled={updatingStatus}
                >
                  Annuler
                </Button>
              )}
              {reservation.status === "confirmed" && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleStatusChange("completed")}
                  disabled={updatingStatus}
                >
                  Terminer
                </Button>
              )}
              {reservation.status === "confirmed" && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleStatusChange("no_show")}
                  disabled={updatingStatus}
                >
                  No-show
                </Button>
              )}
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Cancel confirmation */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler cette réservation ?</AlertDialogTitle>
            <AlertDialogDescription>
              La réservation de {reservation.name} pour le{" "}
              {new Date(reservation.date + "T00:00:00").toLocaleDateString("fr-FR")} à{" "}
              {reservation.time} sera marquée comme annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Retour</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirmer l&apos;annulation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function InfoField({ label, value, span = 1 }: { label: string; value: string; span?: number }) {
  return (
    <div className={span === 2 ? "col-span-2" : ""}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  );
}
