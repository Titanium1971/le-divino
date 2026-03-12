"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { setSetting } from "@/lib/supabase/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

type Props = {
  initialActif: boolean;
  initialMessageFr: string;
  initialMessageEn: string;
  initialMessageIt: string;
  initialMessageEs: string;
  initialMessageDe: string;
  initialDateDebut: string;
  initialDateFin: string;
};

export function CongesManager({
  initialActif,
  initialMessageFr,
  initialMessageEn,
  initialMessageIt,
  initialMessageEs,
  initialMessageDe,
  initialDateDebut,
  initialDateFin,
}: Props) {
  const supabase = createClient();

  const [actif, setActif] = useState(initialActif);
  const [messageFr, setMessageFr] = useState(initialMessageFr);
  const [messageEn, setMessageEn] = useState(initialMessageEn);
  const [messageIt, setMessageIt] = useState(initialMessageIt);
  const [messageEs, setMessageEs] = useState(initialMessageEs);
  const [messageDe, setMessageDe] = useState(initialMessageDe);
  const [dateDebut, setDateDebut] = useState(initialDateDebut);
  const [dateFin, setDateFin] = useState(initialDateFin);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleTranslate() {
    if (!messageFr) return;
    setTranslating(true);
    setError(null);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Congés", description: messageFr }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Translation failed");

      setMessageEn(data.description?.en || messageEn);
      setMessageIt(data.description?.it || messageIt);
      setMessageEs(data.description?.es || messageEs);
      setMessageDe(data.description?.de || messageDe);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de traduction.");
    } finally {
      setTranslating(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      await Promise.all([
        setSetting(supabase, "conges_actif", actif),
        setSetting(supabase, "conges_message_fr", messageFr),
        setSetting(supabase, "conges_message_en", messageEn),
        setSetting(supabase, "conges_message_it", messageIt),
        setSetting(supabase, "conges_message_es", messageEs),
        setSetting(supabase, "conges_message_de", messageDe),
        setSetting(supabase, "conges_date_debut", dateDebut),
        setSetting(supabase, "conges_date_fin", dateFin),
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-light tracking-wide">Congés & Fermeture</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Activez le mode congés pour informer les clients et bloquer les réservations.
      </p>

      <Separator className="my-6" />

      {/* Toggle */}
      <div className="flex items-center justify-between rounded-lg border p-5">
        <div>
          <p className="text-base font-medium">Établissement fermé</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {actif
              ? "Le restaurant est marqué comme fermé. Les réservations sont bloquées."
              : "Le restaurant est ouvert. Les réservations sont actives."}
          </p>
        </div>
        <Switch checked={actif} onCheckedChange={setActif} />
      </div>

      {/* Fields shown when active */}
      {actif && (
        <div className="mt-6 space-y-6 animate-in fade-in-0 slide-in-from-top-2 duration-300">
          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="conges-debut">Date de début</Label>
              <Input
                id="conges-debut"
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="conges-fin">Date de fin</Label>
              <Input
                id="conges-fin"
                type="date"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
              />
            </div>
          </div>

          <Separator />

          {/* Message FR */}
          <div className="space-y-2">
            <Label htmlFor="conges-msg-fr">Message (FR)</Label>
            <Textarea
              id="conges-msg-fr"
              value={messageFr}
              onChange={(e) => setMessageFr(e.target.value)}
              placeholder="Le restaurant est fermé pour congés annuels du ... au ... Nous avons hâte de vous retrouver !"
              rows={3}
            />
          </div>

          {/* Translate button */}
          <div className="flex items-center justify-between rounded-md border border-dashed p-3">
            <p className="text-xs text-muted-foreground">
              Traduire le message automatiquement.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTranslate}
              disabled={translating || !messageFr}
            >
              {translating ? "Traduction..." : "Traduire FR → EN/IT/ES/DE"}
            </Button>
          </div>

          {/* Translations */}
          <div className="space-y-2">
            <Label>Message (traductions)</Label>
            <div className="grid grid-cols-2 gap-2">
              <Textarea
                value={messageEn}
                onChange={(e) => setMessageEn(e.target.value)}
                placeholder="EN"
                rows={2}
              />
              <Textarea
                value={messageIt}
                onChange={(e) => setMessageIt(e.target.value)}
                placeholder="IT"
                rows={2}
              />
              <Textarea
                value={messageEs}
                onChange={(e) => setMessageEs(e.target.value)}
                placeholder="ES"
                rows={2}
              />
              <Textarea
                value={messageDe}
                onChange={(e) => setMessageDe(e.target.value)}
                placeholder="DE"
                rows={2}
              />
            </div>
          </div>
        </div>
      )}

      <Separator className="my-6" />

      {/* Save */}
      <div>
        {error && <p className="mb-2 text-sm text-destructive">{error}</p>}
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Enregistrement..." : saved ? "Enregistré ✓" : "Enregistrer"}
        </Button>
      </div>
    </div>
  );
}
