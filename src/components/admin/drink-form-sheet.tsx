"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { createDrink, updateDrink, uploadDrinkImage, deleteDrinkImage, getDrinkImageUrl } from "@/lib/supabase/drinks";
import type { Drink, DrinkFormData, DrinkCategory } from "@/lib/types/database";
import { DRINK_CATEGORIES } from "@/lib/types/database";
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
  drink: Drink | null;
  onSaved: () => Promise<void>;
  onRefresh?: (drinkId?: string) => Promise<void>;
};

export function DrinkFormSheet({ open, onOpenChange, drink, onSaved, onRefresh }: Props) {
  const supabase = createClient();
  const isEdit = !!drink;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [descFr, setDescFr] = useState("");
  const [descEn, setDescEn] = useState("");
  const [descIt, setDescIt] = useState("");
  const [descEs, setDescEs] = useState("");
  const [descDe, setDescDe] = useState("");
  const [category, setCategory] = useState<DrinkCategory>("soft");
  const [price, setPrice] = useState("");
  const [available, setAvailable] = useState(true);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (drink) {
      setName(drink.name ?? "");
      setDescFr(drink.description_fr ?? "");
      setDescEn(drink.description_en ?? "");
      setDescIt(drink.description_it ?? "");
      setDescEs(drink.description_es ?? "");
      setDescDe(drink.description_de ?? "");
      setCategory(drink.category);
      setPrice(drink.price != null ? String(Number(drink.price)) : "");
      setAvailable(drink.available);
      setImagePath(drink.image_path);
    } else {
      setName("");
      setDescFr("");
      setDescEn("");
      setDescIt("");
      setDescEs("");
      setDescDe("");
      setCategory("soft");
      setPrice("");
      setAvailable(true);
      setImagePath(null);
    }
    setError(null);
  }, [drink, open]);

  async function handleTranslate() {
    if (!descFr) return;
    setTranslating(true);
    setError(null);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || "Boisson", description: descFr }),
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

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !drink) return;

    setUploading(true);
    setError(null);
    try {
      const path = await uploadDrinkImage(supabase, file, drink.id);
      await updateDrink(supabase, drink.id, { image_path: path });
      setImagePath(path);
      if (onRefresh) await onRefresh(drink.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'upload.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleImageDelete() {
    if (!drink || !imagePath) return;
    setError(null);
    try {
      await deleteDrinkImage(supabase, imagePath);
      await updateDrink(supabase, drink.id, { image_path: null });
      setImagePath(null);
      if (onRefresh) await onRefresh(drink.id);
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
      const formData: DrinkFormData = {
        name,
        description_fr: descFr.trim() || null,
        description_en: descEn.trim() || null,
        description_it: descIt.trim() || null,
        description_es: descEs.trim() || null,
        description_de: descDe.trim() || null,
        category,
        price: price ? parseFloat(price) : null,
        available,
      };

      if (isEdit) {
        await updateDrink(supabase, drink.id, formData);
      } else {
        await createDrink(supabase, formData);
      }

      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  }

  const imageUrl = imagePath ? getDrinkImageUrl(supabase, imagePath) : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Modifier la boisson" : "Ajouter une boisson"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Modifiez les informations de la boisson."
              : "Remplissez les informations de la boisson."}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-10rem)] px-4">
          <form id="drink-form" onSubmit={handleSubmit} className="space-y-6 pb-8 pt-4">
            <div className="space-y-2">
              <Label htmlFor="drink-name">Nom</Label>
              <Input
                id="drink-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex : Coca-Cola, Mojito, Expresso..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as DrinkCategory)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DRINK_CATEGORIES.map((dc) => (
                      <SelectItem key={dc.value} value={dc.value}>
                        {dc.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="drink-price">Prix (€)</Label>
                <Input
                  id="drink-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="drink-available">Disponible</Label>
              <Switch id="drink-available" checked={available} onCheckedChange={setAvailable} />
            </div>

            <Separator />

            {/* Photo */}
            {isEdit && (
              <div className="space-y-3">
                <Label>Photo</Label>
                {imageUrl ? (
                  <div className="flex items-start gap-4">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                      <Image
                        src={`${imageUrl}?t=${Date.now()}`}
                        alt={name}
                        fill
                        className="object-cover"
                        sizes="80px"
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
              <Label htmlFor="drink-desc">Description (FR)</Label>
              <Textarea
                id="drink-desc"
                value={descFr}
                onChange={(e) => setDescFr(e.target.value)}
                placeholder="Description de la boisson..."
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
          <Button type="submit" form="drink-form" disabled={saving} className="w-full">
            {saving ? "Enregistrement..." : isEdit ? "Mettre à jour" : "Créer la boisson"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
