"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { createMenu, updateMenu, addDishToMenu, removeDishFromMenu } from "@/lib/supabase/menus";
import { logActivity } from "@/lib/supabase/activity-log";
import type { Menu, MenuFormData, MenuType, MenuDish } from "@/lib/types/database";
import { MENU_TYPES } from "@/lib/types/database";
import type { DishGroup } from "@/lib/supabase/dishes";
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
import { Badge } from "@/components/ui/badge";
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
  menu: Menu | null;
  menuDishes: MenuDish[];
  dishGroups: DishGroup[];
  onSaved: () => Promise<void>;
};

export function MenuFormSheet({ open, onOpenChange, menu, menuDishes, dishGroups, onSaved }: Props) {
  const supabase = createClient();
  const isEdit = !!menu;

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
  const [price, setPrice] = useState("");
  const [type, setType] = useState<MenuType>("entree_plat");
  const [active, setActive] = useState(true);
  const [selectedDishIds, setSelectedDishIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (menu) {
      setNameFr(menu.name_fr ?? "");
      setNameEn(menu.name_en ?? "");
      setNameIt(menu.name_it ?? "");
      setNameEs(menu.name_es ?? "");
      setNameDe(menu.name_de ?? "");
      setDescFr(menu.description_fr ?? "");
      setDescEn(menu.description_en ?? "");
      setDescIt(menu.description_it ?? "");
      setDescEs(menu.description_es ?? "");
      setDescDe(menu.description_de ?? "");
      setPrice(String(Number(menu.price)));
      setType(menu.type);
      setActive(menu.active);
      setSelectedDishIds(new Set(menuDishes.map((md) => md.dish_id)));
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
      setPrice("");
      setType("entree_plat");
      setActive(true);
      setSelectedDishIds(new Set());
    }
    setError(null);
  }, [menu, menuDishes, open]);

  function toggleDish(dishId: string) {
    setSelectedDishIds((prev) => {
      const next = new Set(prev);
      if (next.has(dishId)) {
        next.delete(dishId);
      } else {
        next.add(dishId);
      }
      return next;
    });
  }

  async function handleGenerate() {
    if (!nameFr) {
      setError("Saisissez un nom de menu avant de générer.");
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/generate-menu-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameFr, type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur de génération");

      if (data.name) setNameFr(data.name);
      if (data.description_fr) setDescFr(data.description_fr);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la génération IA.");
    } finally {
      setGenerating(false);
    }
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de traduction.");
    } finally {
      setTranslating(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nameFr || !price) {
      setError("Nom et prix sont obligatoires.");
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice)) {
      setError("Le prix doit être un nombre valide.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const formData: MenuFormData = {
        name_fr: nameFr,
        name_en: nameEn.trim() || null,
        name_it: nameIt.trim() || null,
        name_es: nameEs.trim() || null,
        name_de: nameDe.trim() || null,
        description_fr: descFr.trim() || null,
        description_en: descEn.trim() || null,
        description_it: descIt.trim() || null,
        description_es: descEs.trim() || null,
        description_de: descDe.trim() || null,
        price: parsedPrice,
        type,
        active,
      };

      let menuId: string;
      if (isEdit) {
        await updateMenu(supabase, menu.id, formData);
        menuId = menu.id;
      } else {
        const created = await createMenu(supabase, formData);
        menuId = created.id;
      }

      // Sync menu_dishes
      const previousIds = new Set(menuDishes.map((md) => md.dish_id));
      const toAdd = [...selectedDishIds].filter((id) => !previousIds.has(id));
      const toRemove = [...previousIds].filter((id) => !selectedDishIds.has(id));

      await Promise.all([
        ...toAdd.map((dishId) => addDishToMenu(supabase, menuId, dishId)),
        ...toRemove.map((dishId) => removeDishFromMenu(supabase, menuId, dishId)),
      ]);

      await logActivity(supabase, {
        action: isEdit ? "UPDATE" : "CREATE",
        entityType: "menu",
        entityId: menuId,
        entityName: nameFr,
      });

      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  }

  // Count selected dishes per category
  function countSelected(group: DishGroup): number {
    return group.dishes.filter((d) => selectedDishIds.has(d.id)).length;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Modifier le menu" : "Ajouter un menu"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Modifiez les informations et les plats du menu."
              : "Remplissez les informations et sélectionnez les plats."}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100dvh-12rem)] px-4">
          <form id="menu-form" onSubmit={handleSubmit} className="space-y-6 pb-8 pt-4">
            <div className="space-y-2">
              <Label htmlFor="menu-name">Nom (FR)</Label>
              <Input
                id="menu-name"
                value={nameFr}
                onChange={(e) => setNameFr(e.target.value)}
                placeholder="Ex : Menu du Marché"
                required
              />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="EN" />
                <Input value={nameIt} onChange={(e) => setNameIt(e.target.value)} placeholder="IT" />
                <Input value={nameEs} onChange={(e) => setNameEs(e.target.value)} placeholder="ES" />
                <Input value={nameDe} onChange={(e) => setNameDe(e.target.value)} placeholder="DE" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="menu-desc">Description (FR)</Label>
              <Textarea
                id="menu-desc"
                value={descFr}
                onChange={(e) => setDescFr(e.target.value)}
                placeholder="Description du menu"
                rows={2}
              />
            </div>

            {/* AI Generation */}
            <div className="flex items-center justify-between rounded-md border border-dashed border-amber-500/50 bg-amber-50/50 p-3">
              <div className="flex-1 pr-3">
                <p className="text-sm font-medium text-amber-900">Générer avec IA</p>
                <p className="text-xs text-amber-700">
                  Nom accrocheur et description carte.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerate}
                disabled={generating || !nameFr}
                className="shrink-0 border-amber-500 text-amber-700 hover:bg-amber-100"
              >
                {generating ? "Génération..." : "Générer"}
              </Button>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Textarea value={descEn} onChange={(e) => setDescEn(e.target.value)} placeholder="EN" rows={2} />
                <Textarea value={descIt} onChange={(e) => setDescIt(e.target.value)} placeholder="IT" rows={2} />
                <Textarea value={descEs} onChange={(e) => setDescEs(e.target.value)} placeholder="ES" rows={2} />
                <Textarea value={descDe} onChange={(e) => setDescDe(e.target.value)} placeholder="DE" rows={2} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as MenuType)}>
                  <SelectTrigger>
                    <SelectValue />
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
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="menu-active">Actif</Label>
              <Switch id="menu-active" checked={active} onCheckedChange={setActive} />
            </div>

            <Separator />

            {/* Dish selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">Plats inclus dans ce menu</Label>
                <Badge variant="secondary">
                  {selectedDishIds.size} sélectionné{selectedDishIds.size !== 1 ? "s" : ""}
                </Badge>
              </div>

              {dishGroups.map((group) => {
                const count = countSelected(group);
                return (
                  <div key={group.category} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium">{group.label}</h4>
                      {count > 0 && (
                        <Badge variant="default" className="text-[10px]">
                          {count}
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1">
                      {group.dishes.map((dish) => {
                        const checked = selectedDishIds.has(dish.id);
                        return (
                          <label
                            key={dish.id}
                            className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 transition-colors ${
                              checked
                                ? "border-primary/30 bg-primary/5"
                                : "border-transparent hover:bg-muted/50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleDish(dish.id)}
                              className="h-4 w-4 rounded border-gray-300 text-primary accent-primary"
                            />
                            <span className="flex-1 text-sm">{dish.name_fr}</span>
                            {Number(dish.price) > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {Number(dish.price).toFixed(2)} €
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </form>
        </ScrollArea>

        <div className="border-t px-4 pt-4">
          <Button type="submit" form="menu-form" disabled={saving} className="w-full">
            {saving ? "Enregistrement..." : isEdit ? "Mettre à jour" : "Créer le menu"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
