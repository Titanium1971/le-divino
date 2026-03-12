"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { createWine, updateWine, uploadWineImage, deleteWineImage, getWineImageUrl } from "@/lib/supabase/wines";
import { logActivity } from "@/lib/supabase/activity-log";
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
import { Separator } from "@/components/ui/separator";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wine: Wine | null;
  onSaved: () => Promise<void>;
  onRefresh?: (wineId?: string) => Promise<void>;
};

export function WineFormSheet({ open, onOpenChange, wine, onSaved, onRefresh }: Props) {
  const supabase = createClient();
  const isEdit = !!wine;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [descFr, setDescFr] = useState("");
  const [descEn, setDescEn] = useState("");
  const [descIt, setDescIt] = useState("");
  const [descEs, setDescEs] = useState("");
  const [descDe, setDescDe] = useState("");
  const [region, setRegion] = useState("");
  const [appellation, setAppellation] = useState("");
  const [color, setColor] = useState<WineColor>("rouge");
  const [vintage, setVintage] = useState("");
  const [grapeVariety, setGrapeVariety] = useState("");
  const [alcoholDegree, setAlcoholDegree] = useState("");
  const [style, setStyle] = useState("");
  const [priceBottle, setPriceBottle] = useState("");
  const [priceGlass, setPriceGlass] = useState("");
  const [available, setAvailable] = useState(true);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [uploading, setUploading] = useState(false);
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
      setVintage(wine.vintage != null ? String(wine.vintage) : "");
      setGrapeVariety(wine.grape_variety ?? "");
      setAlcoholDegree(wine.alcohol_degree ?? "");
      setStyle(wine.style ?? "");
      setPriceBottle(wine.price_bottle != null ? String(Number(wine.price_bottle)) : "");
      setPriceGlass(wine.price_glass != null ? String(Number(wine.price_glass)) : "");
      setAvailable(wine.available);
      setImagePath(wine.image_path);
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
      setVintage("");
      setGrapeVariety("");
      setAlcoholDegree("");
      setStyle("");
      setPriceBottle("");
      setPriceGlass("");
      setAvailable(true);
      setImagePath(null);
    }
    setError(null);
  }, [wine, open]);

  async function handleTranslate() {
    if (!descFr) return;
    setTranslating(true);
    setError(null);
    try {
      console.log("[wine-translate] descFr:", descFr, "name:", name);
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || "Vin", description: descFr }),
      });
      const data = await res.json();
      console.log("[wine-translate] response:", data);
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

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !wine) return;

    setUploading(true);
    setError(null);
    try {
      const path = await uploadWineImage(supabase, file, wine.id);
      await updateWine(supabase, wine.id, { image_path: path });
      setImagePath(path);
      if (onRefresh) await onRefresh(wine.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'upload.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleImageDelete() {
    if (!wine || !imagePath) return;
    setError(null);
    try {
      await deleteWineImage(supabase, imagePath);
      await updateWine(supabase, wine.id, { image_path: null });
      setImagePath(null);
      if (onRefresh) await onRefresh(wine.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la suppression.");
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
        vintage: vintage ? parseInt(vintage) : null,
        grape_variety: grapeVariety.trim() || null,
        alcohol_degree: alcoholDegree.trim() || null,
        style: style.trim() || null,
        price_bottle: priceBottle ? parseFloat(priceBottle) : null,
        price_glass: priceGlass ? parseFloat(priceGlass) : null,
        available,
      };

      let savedId: string;
      if (isEdit) {
        await updateWine(supabase, wine.id, formData);
        savedId = wine.id;
      } else {
        const created = await createWine(supabase, formData);
        savedId = created.id;
      }

      await logActivity(supabase, {
        action: isEdit ? "UPDATE" : "CREATE",
        entityType: "wine",
        entityId: savedId,
        entityName: name,
      });

      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  }

  const imageUrl = imagePath ? getWineImageUrl(supabase, imagePath) : null;

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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="wine-region">Région</Label>
                <Input
                  id="wine-region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="Ex : Bordeaux"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wine-vintage">Millésime</Label>
                <Input
                  id="wine-vintage"
                  type="number"
                  min="1900"
                  max="2099"
                  value={vintage}
                  onChange={(e) => setVintage(e.target.value)}
                  placeholder="Ex : 2018"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="wine-grape">Cépage</Label>
                <Input
                  id="wine-grape"
                  value={grapeVariety}
                  onChange={(e) => setGrapeVariety(e.target.value)}
                  placeholder="Ex : Cabernet-Sauvignon"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wine-alcohol">Degré d&apos;alcool</Label>
                <Input
                  id="wine-alcohol"
                  value={alcoholDegree}
                  onChange={(e) => setAlcoholDegree(e.target.value)}
                  placeholder="Ex : 13,5°"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="wine-style">Style</Label>
              <Input
                id="wine-style"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                placeholder="Ex : Fruité, Tannique, Puissant"
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

            <Separator />

            {/* Photo */}
            {isEdit && (
              <div className="space-y-3">
                <Label>Photo</Label>
                {imageUrl ? (
                  <div className="flex items-start gap-4">
                    <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                      <Image
                        src={`${imageUrl}?t=${Date.now()}`}
                        alt={name}
                        fill
                        className="object-cover"
                        sizes="64px"
                        unoptimized
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        {uploading ? "Upload..." : "Remplacer"}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={handleImageDelete}
                      >
                        Supprimer la photo
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? "Upload..." : "Ajouter une photo"}
                  </Button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
            )}

            <Separator />

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

            {descFr.length > 800 && (
              <p className="text-xs text-amber-600">
                La description sera tronquée à 800 caractères pour la traduction ({descFr.length}/800).
              </p>
            )}

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
