"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { createDish, updateDish, uploadDishImage, deleteDishImage, getDishImageUrl } from "@/lib/supabase/dishes";
import type { Dish, DishFormData, DishCategory, DishSource } from "@/lib/types/database";
import { DISH_CATEGORIES, DISH_SOURCES } from "@/lib/types/database";
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
  dish: Dish | null;
  onSaved: () => Promise<void>;
  onRefresh?: (dishId?: string) => Promise<void>;
};

export function DishFormSheet({ open, onOpenChange, dish, onSaved, onRefresh }: Props) {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const isEdit = !!dish;

  // Form state
  const [nameFr, setNameFr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [nameIt, setNameIt] = useState("");
  const [nameEs, setNameEs] = useState("");
  const [nameDe, setNameDe] = useState("");
  const [descFr, setDescFr] = useState("");
  const [descEn, setDescEn] = useState("");
  const [descIt, setDescIt] = useState("");
  const [descEs, setDescEs] = useState("");
  const [descDe, setDescDe] = useState("");
  const [category, setCategory] = useState<DishCategory>("plat");
  const [source, setSource] = useState<DishSource>("carte");
  const [price, setPrice] = useState("");
  const [available, setAvailable] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [remoteUrl, setRemoteUrl] = useState<string | null>(null);
  const [imageKey, setImageKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [deletingImage, setDeletingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayImage = localPreview ?? remoteUrl;

  // Reset form when dish changes
  useEffect(() => {
    if (dish) {
      setNameFr(dish.name_fr ?? "");
      setNameEn(dish.name_en ?? "");
      setNameIt(dish.name_it ?? "");
      setNameEs(dish.name_es ?? "");
      setNameDe(dish.name_de ?? "");
      setDescFr(dish.description_fr ?? "");
      setDescEn(dish.description_en ?? "");
      setDescIt(dish.description_it ?? "");
      setDescEs(dish.description_es ?? "");
      setDescDe(dish.description_de ?? "");
      setCategory(dish.category);
      setSource(dish.source);
      setPrice(String(Number(dish.price)));
      setAvailable(dish.available);
      setImageFile(null);
      setLocalPreview(null);
      setRemoteUrl(dish.image_path ? getDishImageUrl(supabase, dish.image_path) : null);
      setImageKey(0);
    } else {
      setNameFr("");
      setNameEn("");
      setNameIt("");
      setNameEs("");
      setNameDe("");
      setDescFr("");
      setDescEn("");
      setDescIt("");
      setDescEs("");
      setDescDe("");
      setCategory("plat");
      setSource("carte");
      setPrice("");
      setAvailable(true);
      setImageFile(null);
      setLocalPreview(null);
      setRemoteUrl(null);
      setImageKey(0);
    }
    setError(null);
  }, [dish, open, supabase]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setLocalPreview(URL.createObjectURL(file));
  }

  async function handleTranslate() {
    if (!nameFr) return;
    setTranslating(true);
    setError(null);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameFr, description: descFr }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Translation failed");

      setNameEn(data.name?.en || nameEn);
      setNameIt(data.name?.it || nameIt);
      setNameEs(data.name?.es || nameEs);
      setNameDe(data.name?.de || nameDe);
      setDescEn(data.description?.en || descEn);
      setDescIt(data.description?.it || descIt);
      setDescEs(data.description?.es || descEs);
      setDescDe(data.description?.de || descDe);

      // Auto-save translations when editing
      if (isEdit && dish) {
        await updateDish(supabase, dish.id, {
          name_en: data.name?.en || nameEn,
          name_it: data.name?.it || nameIt,
          name_es: data.name?.es || nameEs,
          name_de: data.name?.de || nameDe,
          description_en: data.description?.en || descEn,
          description_it: data.description?.it || descIt,
          description_es: data.description?.es || descEs,
          description_de: data.description?.de || descDe,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la traduction automatique.");
    } finally {
      setTranslating(false);
    }
  }

  async function handleGenerateAI() {
    if (!isEdit || !dish) return;
    setGeneratingAI(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/generate-dish-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dishId: dish.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur génération IA");
      setLocalPreview(null);
      setImageFile(null);
      setRemoteUrl(data.publicUrl);
      setImageKey((k) => k + 1);
      if (onRefresh) await onRefresh(dish.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur génération IA");
    } finally {
      setGeneratingAI(false);
    }
  }

  async function handleDeleteImage() {
    if (!isEdit || !dish?.image_path) return;
    setDeletingImage(true);
    setError(null);
    try {
      await deleteDishImage(supabase, dish.image_path);
      await updateDish(supabase, dish.id, { image_path: null });
      setLocalPreview(null);
      setRemoteUrl(null);
      setImageFile(null);
      setImageKey((k) => k + 1);
      if (onRefresh) await onRefresh(dish.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur suppression photo");
    } finally {
      setDeletingImage(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nameFr || !price) {
      setError("Nom (FR) et prix sont obligatoires.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const formData: DishFormData = {
        name_fr: nameFr,
        name_en: nameEn || null,
        name_it: nameIt || null,
        name_es: nameEs || null,
        name_de: nameDe || null,
        description_fr: descFr || null,
        description_en: descEn || null,
        description_it: descIt || null,
        description_es: descEs || null,
        description_de: descDe || null,
        category,
        source,
        price: parseFloat(price),
        available,
      };

      let saved: Dish;
      if (isEdit) {
        saved = await updateDish(supabase, dish.id, formData);
      } else {
        saved = await createDish(supabase, formData);
      }

      if (imageFile) {
        const path = await uploadDishImage(supabase, imageFile, saved.id);
        await updateDish(supabase, saved.id, { image_path: path });
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
      <SheetContent className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Modifier le plat" : "Ajouter un plat"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Modifiez les informations du plat."
              : "Remplissez les informations du nouveau plat."}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-10rem)] px-4">
          <form id="dish-form" onSubmit={handleSubmit} className="space-y-6 pb-8 pt-4">
            {/* ── Source, Category & Price ── */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Source</Label>
                <Select value={source} onValueChange={(v) => setSource(v as DishSource)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Source..." />
                  </SelectTrigger>
                  <SelectContent>
                    {DISH_SOURCES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as DishCategory)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>
                  <SelectContent>
                    {DISH_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Prix (€)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* ── Translate button ── */}
            <div className="flex items-center justify-between rounded-md border border-dashed p-3">
              <p className="text-xs text-muted-foreground">
                Remplissez le français, puis traduisez automatiquement.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTranslate}
                disabled={translating || !nameFr}
              >
                {translating ? "Traduction..." : "Traduire FR → EN/IT/ES/DE"}
              </Button>
            </div>

            {/* ── Name fields ── */}
            <div className="space-y-3">
              <Label>Nom du plat</Label>
              <Input value={nameFr} onChange={(e) => setNameFr(e.target.value)} placeholder="Nom (FR)" required />
              <div className="grid grid-cols-4 gap-2">
                <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="EN" />
                <Input value={nameIt} onChange={(e) => setNameIt(e.target.value)} placeholder="IT" />
                <Input value={nameEs} onChange={(e) => setNameEs(e.target.value)} placeholder="ES" />
                <Input value={nameDe} onChange={(e) => setNameDe(e.target.value)} placeholder="DE" />
              </div>
            </div>

            {/* ── Description fields ── */}
            <div className="space-y-3">
              <Label>Description</Label>
              <Textarea value={descFr} onChange={(e) => setDescFr(e.target.value)} placeholder="Description (FR)" rows={3} />
              <div className="grid grid-cols-4 gap-2">
                <Textarea value={descEn} onChange={(e) => setDescEn(e.target.value)} placeholder="EN" rows={2} />
                <Textarea value={descIt} onChange={(e) => setDescIt(e.target.value)} placeholder="IT" rows={2} />
                <Textarea value={descEs} onChange={(e) => setDescEs(e.target.value)} placeholder="ES" rows={2} />
                <Textarea value={descDe} onChange={(e) => setDescDe(e.target.value)} placeholder="DE" rows={2} />
              </div>
            </div>

            {/* ── Photo ── */}
            <div className="space-y-2">
              <Label>Photo</Label>
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border bg-muted">
                  {displayImage && (
                    <Image
                      key={imageKey}
                      src={displayImage}
                      alt="Aperçu"
                      fill
                      className="object-cover"
                      sizes="80px"
                      unoptimized
                    />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileRef.current?.click()}
                  >
                    {displayImage ? "Changer la photo" : "Ajouter une photo"}
                  </Button>
                  {isEdit && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateAI}
                      disabled={generatingAI}
                    >
                      {generatingAI ? "Génération IA..." : "Générer avec DALL-E"}
                    </Button>
                  )}
                  {isEdit && displayImage && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                      onClick={handleDeleteImage}
                      disabled={deletingImage}
                    >
                      {deletingImage ? "Suppression..." : "Supprimer la photo"}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* ── Available toggle ── */}
            <div className="flex items-center justify-between">
              <Label htmlFor="available">Disponible</Label>
              <Switch id="available" checked={available} onCheckedChange={setAvailable} />
            </div>

            {/* ── Error ── */}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </form>
        </ScrollArea>

        {/* ── Submit ── */}
        <div className="border-t px-4 pt-4">
          <Button type="submit" form="dish-form" disabled={saving} className="w-full">
            {saving ? "Enregistrement..." : isEdit ? "Mettre à jour" : "Créer le plat"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
