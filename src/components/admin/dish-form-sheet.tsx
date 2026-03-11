"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { createDish, updateDish, uploadDishImage, deleteDishImage, getDishImageUrl } from "@/lib/supabase/dishes";
import type { Category, Dish, DishFormData, I18nField, Locale, MenuType } from "@/lib/types/database";
import { ALLERGENS, MENU_TYPES } from "@/lib/types/database";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

const LOCALES: { key: Locale; label: string }[] = [
  { key: "fr", label: "FR" },
  { key: "en", label: "EN" },
  { key: "it", label: "IT" },
  { key: "es", label: "ES" },
  { key: "de", label: "DE" },
];

const emptyI18n = (): I18nField => ({ fr: "", en: "", it: "", es: "", de: "" });

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dish: Dish | null;
  categories: Category[];
  onSaved: () => Promise<void>;
  onRefresh?: () => Promise<void>;
};

export function DishFormSheet({ open, onOpenChange, dish, categories, onSaved, onRefresh }: Props) {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const isEdit = !!dish;

  // Form state
  const [name, setName] = useState<I18nField>(emptyI18n());
  const [description, setDescription] = useState<I18nField>(emptyI18n());
  const [categoryId, setCategoryId] = useState("");
  const [menuType, setMenuType] = useState<MenuType>("carte");
  const [price, setPrice] = useState("");
  const [allergens, setAllergens] = useState<string[]>([]);
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isSignature, setIsSignature] = useState(false);
  const [available, setAvailable] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageKey, setImageKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [deletingImage, setDeletingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when dish changes
  useEffect(() => {
    if (dish) {
      setName(dish.name ?? emptyI18n());
      setDescription(dish.description ?? emptyI18n());
      setCategoryId(dish.category_id);
      setMenuType(dish.menu_type ?? "carte");
      setPrice(String(Number(dish.price)));
      setAllergens(dish.allergens ?? []);
      setIsVegetarian(dish.is_vegetarian);
      setIsSignature(dish.is_signature);
      setAvailable(dish.available);
      setImageFile(null);
      setImagePreview(dish.image_path ? getDishImageUrl(supabase, dish.image_path) : null);
    } else {
      setName(emptyI18n());
      setDescription(emptyI18n());
      setCategoryId(categories[0]?.id ?? "");
      setMenuType("carte");
      setPrice("");
      setAllergens([]);
      setIsVegetarian(false);
      setIsSignature(false);
      setAvailable(true);
      setImageFile(null);
      setImagePreview(null);
    }
    setError(null);
  }, [dish, open, categories, supabase]);

  function updateI18n(
    setter: React.Dispatch<React.SetStateAction<I18nField>>,
    locale: Locale,
    value: string,
  ) {
    setter((prev) => ({ ...prev, [locale]: value }));
  }

  function toggleAllergen(allergen: string) {
    setAllergens((prev) =>
      prev.includes(allergen) ? prev.filter((a) => a !== allergen) : [...prev, allergen],
    );
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleTranslate() {
    if (!name.fr) return;
    setTranslating(true);
    setError(null);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.fr, description: description.fr }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Translation failed");

      const newName: I18nField = {
        ...name,
        en: data.name?.en || name.en,
        it: data.name?.it || name.it,
        es: data.name?.es || name.es,
        de: data.name?.de || name.de,
      };
      const newDesc: I18nField = {
        ...description,
        en: data.description?.en || description.en,
        it: data.description?.it || description.it,
        es: data.description?.es || description.es,
        de: data.description?.de || description.de,
      };

      setName(newName);
      setDescription(newDesc);

      // Auto-save translations to DB when editing an existing dish
      if (isEdit && dish) {
        await updateDish(supabase, dish.id, { name: newName, description: newDesc });
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
      // Force new URL + re-render via key change to bust Next.js Image cache
      setImagePreview(data.publicUrl);
      setImageKey((k) => k + 1);
      setImageFile(null);
      // Refresh the list without closing the sheet
      if (onRefresh) await onRefresh();
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
      setImagePreview(null);
      setImageFile(null);
      setImageKey((k) => k + 1);
      // Refresh the list without closing the sheet
      if (onRefresh) await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur suppression photo");
    } finally {
      setDeletingImage(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.fr || !categoryId || !price) {
      setError("Nom (FR), catégorie et prix sont obligatoires.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const formData: DishFormData = {
        category_id: categoryId,
        menu_type: menuType,
        name,
        description,
        price: parseFloat(price),
        allergens,
        is_vegetarian: isVegetarian,
        is_signature: isSignature,
        available,
      };

      let saved: Dish;
      if (isEdit) {
        saved = await updateDish(supabase, dish.id, formData);
      } else {
        saved = await createDish(supabase, formData);
      }

      // Upload image if selected
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
            {/* ── Menu Type, Category & Price ── */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Menu</Label>
                <Select value={menuType} onValueChange={(v) => setMenuType(v as MenuType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {MENU_TYPES.map((mt) => (
                      <SelectItem key={mt.value} value={mt.value}>
                        {mt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
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
                disabled={translating || !name.fr}
              >
                {translating ? "Traduction..." : "Traduire FR → EN/IT/ES/DE"}
              </Button>
            </div>

            {/* ── Name i18n ── */}
            <div className="space-y-2">
              <Label>Nom du plat</Label>
              <Tabs defaultValue="fr">
                <TabsList className="w-full">
                  {LOCALES.map((l) => (
                    <TabsTrigger key={l.key} value={l.key} className="flex-1">
                      {l.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {LOCALES.map((l) => (
                  <TabsContent key={l.key} value={l.key}>
                    <Input
                      value={name[l.key]}
                      onChange={(e) => updateI18n(setName, l.key, e.target.value)}
                      placeholder={`Nom (${l.label})`}
                      required={l.key === "fr"}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            {/* ── Description i18n ── */}
            <div className="space-y-2">
              <Label>Description</Label>
              <Tabs defaultValue="fr">
                <TabsList className="w-full">
                  {LOCALES.map((l) => (
                    <TabsTrigger key={l.key} value={l.key} className="flex-1">
                      {l.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {LOCALES.map((l) => (
                  <TabsContent key={l.key} value={l.key}>
                    <Textarea
                      value={description[l.key]}
                      onChange={(e) => updateI18n(setDescription, l.key, e.target.value)}
                      placeholder={`Description (${l.label})`}
                      rows={3}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            {/* ── Photo ── */}
            <div className="space-y-2">
              <Label>Photo</Label>
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border bg-muted">
                  {imagePreview && (
                    <Image
                      key={imageKey}
                      src={imagePreview}
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
                    {imagePreview ? "Changer la photo" : "Ajouter une photo"}
                  </Button>
                  {isEdit && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateAI}
                      disabled={generatingAI}
                    >
                      {generatingAI ? "Génération IA..." : "📷 Générer avec DALL-E"}
                    </Button>
                  )}
                  {isEdit && imagePreview && (
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

            {/* ── Allergens ── */}
            <div className="space-y-2">
              <Label>Allergènes</Label>
              <div className="flex flex-wrap gap-2">
                {ALLERGENS.map((allergen) => (
                  <Badge
                    key={allergen}
                    variant={allergens.includes(allergen) ? "default" : "outline"}
                    className="cursor-pointer select-none"
                    onClick={() => toggleAllergen(allergen)}
                  >
                    {allergen}
                  </Badge>
                ))}
              </div>
            </div>

            {/* ── Toggles ── */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="vegetarian">Végétarien</Label>
                <Switch
                  id="vegetarian"
                  checked={isVegetarian}
                  onCheckedChange={setIsVegetarian}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="signature">Plat signature</Label>
                <Switch
                  id="signature"
                  checked={isSignature}
                  onCheckedChange={setIsSignature}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="available">Disponible</Label>
                <Switch id="available" checked={available} onCheckedChange={setAvailable} />
              </div>
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
