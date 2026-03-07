"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { createReservation } from "@/lib/supabase/reservations";
import type { ReservationStatus } from "@/lib/types/database";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => Promise<void>;
};

export function ReservationFormSheet({ open, onOpenChange, onSaved }: Props) {
  const supabase = createClient();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState<number | "">("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<ReservationStatus>("confirmed");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetForm() {
    setName("");
    setPhone("");
    setEmail("");
    setDate("");
    setTime("");
    setGuests("");
    setMessage("");
    setStatus("confirmed");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name || !date || !time || !guests) {
      setError("Nom, date, heure et nombre de couverts sont obligatoires.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await createReservation(supabase, {
        name,
        email: email || undefined,
        phone: phone || undefined,
        date,
        time,
        guests: Number(guests),
        message: message || undefined,
        status,
      });

      resetForm();
      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création.");
    } finally {
      setSaving(false);
    }
  }

  function handleOpenChange(open: boolean) {
    if (!open) resetForm();
    onOpenChange(open);
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Nouvelle réservation</SheetTitle>
          <SheetDescription>
            Saisie manuelle (réservation téléphonique, sur place, etc.)
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-10rem)] px-4">
          <form id="reservation-form" onSubmit={handleSubmit} className="space-y-5 pb-8 pt-4">
            {/* Nom */}
            <div className="space-y-2">
              <Label htmlFor="res-name">Nom *</Label>
              <Input
                id="res-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nom du client"
                required
              />
            </div>

            {/* Téléphone + Email */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="res-phone">Téléphone</Label>
                <Input
                  id="res-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+33 6 ..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="res-email">Email</Label>
                <Input
                  id="res-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemple.com"
                />
              </div>
            </div>

            {/* Date + Heure */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="res-date">Date *</Label>
                <Input
                  id="res-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="res-time">Heure *</Label>
                <Input
                  id="res-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Couverts + Statut */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="res-guests">Couverts *</Label>
                <Input
                  id="res-guests"
                  type="number"
                  min={1}
                  value={guests}
                  onChange={(e) => setGuests(e.target.value ? Number(e.target.value) : "")}
                  placeholder="2"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as ReservationStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">Confirmée</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Commentaire */}
            <div className="space-y-2">
              <Label htmlFor="res-message">Commentaire</Label>
              <Textarea
                id="res-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Notes, allergies, demandes spéciales..."
                rows={3}
              />
            </div>

            {/* Error */}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </form>
        </ScrollArea>

        {/* Submit */}
        <div className="border-t px-4 pt-4">
          <Button type="submit" form="reservation-form" disabled={saving} className="w-full">
            {saving ? "Enregistrement..." : "Créer la réservation"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
