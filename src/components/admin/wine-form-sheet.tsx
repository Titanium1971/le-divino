"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { createWine, updateWine } from "@/lib/supabase/wines";
import type { Wine, WineFormData, WineColor } from "@/lib/types/database";
import { WINE_COLORS } from "@/lib/types/database";
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
import { Switch } from "@/components/ui/switch";
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
  wine: Wine | null;
  onSaved: () => Promise<void>;
};

export function WineFormSheet({ open, onOpenChange, wine, onSaved }: Props) {
  const supabase = createClient();
  const isEdit = !!wine;

  const [name, setName] = useState("");
  const [descFr, setDescFr] = useState("");
  const [descEn, setDescEn] = useState("");
  const [descIt, setDescIt] = useState("");
  const [descEs, setDescEs] = useState("");
  const [descDe, setDescDe] = useState("");
  const [region, setRegion] = useState("");
  const [appellation, setAppellation] = useState("");
  const [color, setColor] = useState<WineColor>("rouge");
  const [priceBottle, setPriceBottle] = useState("");
  const [priceGlass, setPriceGlass] = useState("");
  const [available, setAvailable] = useState(true);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (wine) {
      setName(wine.name ?? "");
      setDescFr(wine.description_fr ?? "");
      setDescEn(wine.description_en ?? "");
      setDescIt(wine.description_it ?? "");
      setDescEs(wine.description_es ?? "");
      setDescDe(wine.description_de ?? "");
      setRegion(wine.region ?? "");
      setAppellation(wine.appellation ?? "");
      setColor(wine.color);
      setPriceBottle(wine.price_bottle != null ? String(Number(wine.price_bottle)) : "");
      setPriceGlass(wine.price_glass != null ? String(Number(wine.price_glass)) : "");
      setAvailable(wine.available);
    } else {
      setName("");
      setDescFr("");
      setDescEn("");
      setDescIt("");
      setDescEs("");
      setDescDe("");
      setRegion("");
      setAppellation("");
      setColor("rouge");
      setPriceBottle("");
      setPriceGlass("");
      setAvailable(true);
    }
    setError(null);
  }, [wine, open]);

  async function handleTranslate() {
    if (!descFr) return;
    setTranslating(true);
    setError(null);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: descFr }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Translation failed");

      setDescEn(data.description?.en || descEn);
      setDescIt(data.description?.it || descIt);
      setDescEs(data.description?.es || descEs);
      setDescDe(data.description?.de || descDe);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de traduction.");
    } finally {
      setTranslating(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name) {
      setError("Le nom est obligatoire.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const formData: WineFormData = {
        name,
        description_fr: descFr.trim() || null,
        description_en: descEn.trim() || null,
        description_it: descIt.trim() || null,
        description_es: descEs.trim() || null,
        description_de: descDe.trim() || null,
        region: region.trim() || null,
        appellation: appellation.trim() || null,
        color,
        price_bottle: priceBottle ? parseFloat(priceBottle) : null,
        price_glass: priceGlass ? parseFloat(priceGlass) : null,
        available,
      };

      if (isEdit) {
        await updateWine(supabase, wine.id, formData);
      } else {
        await createWine(supabase, formData);
      }

      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Modifier le vin" : "Ajouter un vin"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Modifiez les informations du vin."
              : "Remplissez les informations du vin."}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-10rem)] px-4">
          <form id="wine-form" onSubmit={handleSubmit} className="space-y-6 pb-8 pt-4">
            <div className="space-y-2">
              <Label htmlFor="wine-name">Nom du vin</Label>
              <Input
                id="wine-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex : Château Margaux 2018"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Couleur</Label>
                <Select value={color} onValueChange={(v) => setColor(v as WineColor)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WINE_COLORS.map((wc) => (
                      <SelectItem key={wc.value} value={wc.value}>
                        {wc.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="wine-appellation">Appellation</Label>
                <Input
                  id="wine-appellation"
                  value={appellation}
                  onChange={(e) => setAppellation(e.target.value)}
                  placeholder="Ex : AOC Margaux"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="wine-region">Région</Label>
              <Input
                id="wine-region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="Ex : Bordeaux"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="wine-price-bottle">Prix bouteille (€)</Label>
                <Input
                  id="wine-price-bottle"
                  type="number"
                  step="0.01"
                  min="0"
                  value={priceBottle}
                  onChange={(e) => setPriceBottle(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wine-price-glass">Prix verre (€)</Label>
                <Input
                  id="wine-price-glass"
                  type="number"
                  step="0.01"
                  min="0"
                  value={priceGlass}
                  onChange={(e) => setPriceGlass(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="wine-available">Disponible</Label>
              <Switch id="wine-available" checked={available} onCheckedChange={setAvailable} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wine-desc">Description (FR)</Label>
              <Textarea
                id="wine-desc"
                value={descFr}
                onChange={(e) => setDescFr(e.target.value)}
                placeholder="Notes de dégustation, cépages..."
                rows={3}
              />
            </div>

            {/* Translate button */}
            <div className="flex items-center justify-between rounded-md border border-dashed p-3">
              <p className="text-xs text-muted-foreground">
                Traduire la description automatiquement.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTranslate}
                disabled={translating || !descFr}
              >
                {translating ? "Traduction..." : "Traduire FR → EN/IT/ES/DE"}
              </Button>
            </div>

            {/* Description translations */}
            <div className="space-y-2">
              <Label>Description (traductions)</Label>
              <div className="grid grid-cols-2 gap-2">
                <Textarea value={descEn} onChange={(e) => setDescEn(e.target.value)} placeholder="EN" rows={2} />
                <Textarea value={descIt} onChange={(e) => setDescIt(e.target.value)} placeholder="IT" rows={2} />
                <Textarea value={descEs} onChange={(e) => setDescEs(e.target.value)} placeholder="ES" rows={2} />
                <Textarea value={descDe} onChange={(e) => setDescDe(e.target.value)} placeholder="DE" rows={2} />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </form>
        </ScrollArea>

        <div className="border-t px-4 pt-4">
          <Button type="submit" form="wine-form" disabled={saving} className="w-full">
            {saving ? "Enregistrement..." : isEdit ? "Mettre à jour" : "Créer le vin"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
