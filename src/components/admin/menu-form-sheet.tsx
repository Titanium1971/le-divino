"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { createMenu, updateMenu } from "@/lib/supabase/menus";
import type {
  Category,
  Dish,
  Menu,
  MenuFormData,
  MenuCourse,
  I18nField,
  Locale,
} from "@/lib/types/database";
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const LOCALES: { key: Locale; label: string }[] = [
  { key: "fr", label: "FR" },
  { key: "en", label: "EN" },
  { key: "it", label: "IT" },
  { key: "es", label: "ES" },
];

const emptyI18n = (): I18nField => ({ fr: "", en: "", it: "", es: "" });

type DishGroup = { category: Category; dishes: Dish[] };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menu: Menu | null;
  dishGroups: DishGroup[];
  onSaved: () => Promise<void>;
};

/**
 * Normalize legacy course data from DB.
 * Seed data has { label, choices: string[] } (dish names),
 * but our type expects { label, dish_ids: string[] } (UUIDs).
 */
function normalizeCourses(
  raw: unknown[],
  dishMap: Map<string, Dish>,
): MenuCourse[] {
  if (!Array.isArray(raw)) return [];

  // Build a reverse map: lowercase french name → dish id
  const nameToId = new Map<string, string>();
  for (const [id, dish] of dishMap) {
    nameToId.set(dish.name.fr.toLowerCase(), id);
  }

  return raw.map((entry) => {
    const obj = entry as Record<string, unknown>;
    const label = (obj.label as string) ?? "";

    // Already in new format
    if (Array.isArray(obj.dish_ids)) {
      return { label, dish_ids: obj.dish_ids as string[] };
    }

    // Legacy format: choices are dish name strings → resolve to IDs
    if (Array.isArray(obj.choices)) {
      const dish_ids = (obj.choices as string[])
        .map((name) => {
          // Try exact match first, then fuzzy prefix match
          const exact = nameToId.get(name.toLowerCase());
          if (exact) return exact;
          for (const [key, id] of nameToId) {
            if (key.startsWith(name.toLowerCase()) || name.toLowerCase().startsWith(key)) {
              return id;
            }
          }
          return null;
        })
        .filter((id): id is string => id !== null);
      return { label, dish_ids };
    }

    return { label, dish_ids: [] };
  });
}

export function MenuFormSheet({ open, onOpenChange, menu, dishGroups, onSaved }: Props) {
  const supabase = createClient();
  const isEdit = !!menu;

  const [name, setName] = useState<I18nField>(emptyI18n());
  const [description, setDescription] = useState<I18nField>(emptyI18n());
  const [price, setPrice] = useState("");
  const [available, setAvailable] = useState(true);
  const [courses, setCourses] = useState<MenuCourse[]>([]);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Build a flat map of dish id → dish for quick lookup
  const dishMap = new Map<string, Dish>();
  for (const group of dishGroups) {
    for (const dish of group.dishes) {
      dishMap.set(dish.id, dish);
    }
  }

  useEffect(() => {
    if (menu) {
      setName(menu.name ?? emptyI18n());
      setDescription(menu.description ?? emptyI18n());
      setPrice(String(Number(menu.price)));
      setAvailable(menu.available);
      setCourses(normalizeCourses(menu.courses as unknown[], dishMap));
    } else {
      setName(emptyI18n());
      setDescription(emptyI18n());
      setPrice("");
      setAvailable(true);
      setCourses([]);
    }
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menu, open]);

  function updateI18n(
    setter: React.Dispatch<React.SetStateAction<I18nField>>,
    locale: Locale,
    value: string,
  ) {
    setter((prev) => ({ ...prev, [locale]: value }));
  }

  // ── Course builder helpers ──

  function addCourse(label = "") {
    setCourses((prev) => [...prev, { label, dish_ids: [] }]);
  }

  function addCourseFromCategory(categoryName: string) {
    setCourses((prev) => [...prev, { label: categoryName, dish_ids: [] }]);
  }

  function removeCourse(index: number) {
    setCourses((prev) => prev.filter((_, i) => i !== index));
  }

  function updateCourseLabel(index: number, label: string) {
    setCourses((prev) => prev.map((c, i) => (i === index ? { ...c, label } : c)));
  }

  function addDishToCourse(index: number, dishId: string) {
    setCourses((prev) =>
      prev.map((c, i) =>
        i === index && !c.dish_ids.includes(dishId)
          ? { ...c, dish_ids: [...c.dish_ids, dishId] }
          : c,
      ),
    );
  }

  function removeDishFromCourse(courseIndex: number, dishId: string) {
    setCourses((prev) =>
      prev.map((c, i) =>
        i === courseIndex ? { ...c, dish_ids: c.dish_ids.filter((id) => id !== dishId) } : c,
      ),
    );
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
      if (!res.ok) {
        throw new Error(data.error || `Erreur serveur (${res.status})`);
      }

      if (!data.name || !data.description) {
        throw new Error("Réponse de traduction invalide (champs manquants).");
      }

      setName((prev) => ({
        ...prev,
        en: data.name.en || prev.en,
        it: data.name.it || prev.it,
        es: data.name.es || prev.es,
      }));
      setDescription((prev) => ({
        ...prev,
        en: data.description.en || prev.en,
        it: data.description.it || prev.it,
        es: data.description.es || prev.es,
      }));
    } catch (err) {
      setError(
        `Traduction échouée : ${err instanceof Error ? err.message : "erreur inconnue"}`,
      );
    } finally {
      setTranslating(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.fr || !price) {
      setError("Nom (FR) et prix sont obligatoires.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const formData: MenuFormData = {
        name,
        description,
        price: parseFloat(price),
        courses,
        available,
      };

      if (isEdit) {
        await updateMenu(supabase, menu.id, formData);
      } else {
        await createMenu(supabase, formData);
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
          <SheetTitle>{isEdit ? "Modifier le menu" : "Ajouter un menu"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Modifiez les informations du menu."
              : "Remplissez les informations du nouveau menu."}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-10rem)] px-4">
          <form id="menu-form" onSubmit={handleSubmit} className="space-y-6 pb-8 pt-4">
            {/* ── Price ── */}
            <div className="space-y-2">
              <Label htmlFor="menu-price">Prix (€)</Label>
              <Input
                id="menu-price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                placeholder="0.00"
              />
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
                {translating ? "Traduction..." : "Traduire FR → EN/IT/ES"}
              </Button>
            </div>

            {/* ── Name i18n ── */}
            <div className="space-y-2">
              <Label>Nom du menu</Label>
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

            {/* ── Available toggle ── */}
            <div className="flex items-center justify-between">
              <Label htmlFor="menu-available">Disponible</Label>
              <Switch id="menu-available" checked={available} onCheckedChange={setAvailable} />
            </div>

            <Separator />

            {/* ── Course builder ── */}
            <div className="space-y-4">
              <Label>Services (composition du menu)</Label>

              {/* Quick-add buttons from existing categories */}
              <div className="flex flex-wrap gap-2">
                {dishGroups.map((group) => (
                  <Button
                    key={group.category.id}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addCourseFromCategory(group.category.name)}
                  >
                    + {group.category.name}
                  </Button>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addCourse()}
                >
                  + Service personnalisé
                </Button>
              </div>

              {courses.length === 0 && (
                <p className="text-sm italic text-muted-foreground">
                  Aucun service. Utilisez les boutons ci-dessus pour composer le menu.
                </p>
              )}

              {courses.map((course, courseIdx) => {
                // Find the matching category for this course label (for smart filtering)
                const matchedGroup = dishGroups.find(
                  (g) => g.category.name.toLowerCase() === course.label.toLowerCase(),
                );
                // Show matching category dishes first, then all others
                const sortedGroups = matchedGroup
                  ? [matchedGroup, ...dishGroups.filter((g) => g.category.id !== matchedGroup.category.id)]
                  : dishGroups;

                return (
                  <div key={courseIdx} className="space-y-3 rounded-lg border p-3">
                    {/* Course header */}
                    <div className="flex items-center gap-2">
                      <Input
                        value={course.label}
                        onChange={(e) => updateCourseLabel(courseIdx, e.target.value)}
                        placeholder="Nom du service (ex: Entrée)"
                        className="flex-1 font-medium"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="shrink-0 text-destructive"
                        onClick={() => removeCourse(courseIdx)}
                      >
                        Supprimer
                      </Button>
                    </div>

                    {/* Dish selector — grouped by category, matched category first */}
                    <Select
                      value=""
                      onValueChange={(val) => addDishToCourse(courseIdx, val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un plat à ajouter..." />
                      </SelectTrigger>
                      <SelectContent>
                        {sortedGroups.map((group) => (
                          <SelectGroup key={group.category.id}>
                            <SelectLabel>
                              {group.category.name}
                              {group.category.id === matchedGroup?.category.id ? " (suggéré)" : ""}
                            </SelectLabel>
                            {group.dishes
                              .filter((d) => !course.dish_ids.includes(d.id))
                              .map((dish) => (
                                <SelectItem key={dish.id} value={dish.id}>
                                  {dish.name.fr} — {Number(dish.price).toFixed(2)} €
                                </SelectItem>
                              ))}
                          </SelectGroup>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Selected dishes as removable badges */}
                    {course.dish_ids.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {course.dish_ids.map((dishId) => {
                          const dish = dishMap.get(dishId);
                          return (
                            <Badge
                              key={dishId}
                              variant="secondary"
                              className="cursor-pointer gap-1 pr-1.5"
                              onClick={() => removeDishFromCourse(courseIdx, dishId)}
                            >
                              {dish?.name.fr ?? "Plat inconnu"}
                              <span className="ml-0.5 text-muted-foreground hover:text-foreground">×</span>
                            </Badge>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs italic text-muted-foreground">
                        Aucun plat sélectionné pour ce service.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ── Error ── */}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </form>
        </ScrollArea>

        {/* ── Submit ── */}
        <div className="border-t px-4 pt-4">
          <Button type="submit" form="menu-form" disabled={saving} className="w-full">
            {saving ? "Enregistrement..." : isEdit ? "Mettre à jour" : "Créer le menu"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
