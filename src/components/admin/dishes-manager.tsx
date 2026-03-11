"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import {
  getDishesGrouped,
  deleteDish,
  deleteDishImage,
  getDishImageUrl,
} from "@/lib/supabase/dishes";
import type { DishGroup } from "@/lib/supabase/dishes";
import type { Dish, DishSource } from "@/lib/types/database";
import { DISH_SOURCES } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { DishFormSheet } from "./dish-form-sheet";

type Props = {
  initialGroups: DishGroup[];
};

export function DishesManager({ initialGroups }: Props) {
  const supabase = createClient();
  const [groups, setGroups] = useState<DishGroup[]>(initialGroups);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Dish | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<DishSource | "all">("all");
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [imageTimestamps, setImageTimestamps] = useState<Record<string, number>>({});
  const [todayDishIds, setTodayDishIds] = useState<Set<string>>(new Set());

  // Fetch today's dish IDs from menu_dishes
  const refreshToday = useCallback(async () => {
    const { data } = await supabase
      .from("menu_dishes")
      .select("dish_id")
      .eq("available_today", true);
    setTodayDishIds(new Set((data ?? []).map((r) => r.dish_id)));
  }, [supabase]);

  useEffect(() => {
    refreshToday();
  }, [refreshToday]);

  const refresh = useCallback(async () => {
    const data = await getDishesGrouped(supabase);
    setGroups(data);
    await refreshToday();
  }, [supabase, refreshToday]);

  function handleAdd() {
    setEditingDish(null);
    setSheetOpen(true);
  }

  function handleEdit(dish: Dish) {
    setEditingDish(dish);
    setSheetOpen(true);
  }

  async function handleToggleAvailable(dish: Dish) {
    await supabase
      .from("dishes")
      .update({ available: !dish.available })
      .eq("id", dish.id);
    await refresh();
  }

  async function handleToggleToday(dish: Dish) {
    const isCurrentlyToday = todayDishIds.has(dish.id);

    if (isCurrentlyToday) {
      // Set available_today = false on all menu_dishes for this dish
      await supabase
        .from("menu_dishes")
        .update({ available_today: false })
        .eq("dish_id", dish.id);
    } else {
      // Check if any menu_dishes row exists for this dish
      const { data: existing } = await supabase
        .from("menu_dishes")
        .select("id")
        .eq("dish_id", dish.id);

      if (existing && existing.length > 0) {
        // Update all existing rows
        await supabase
          .from("menu_dishes")
          .update({ available_today: true })
          .eq("dish_id", dish.id);
      } else {
        // Insert into all active menus
        const { data: menus } = await supabase
          .from("menus")
          .select("id")
          .eq("active", true);

        if (menus && menus.length > 0) {
          await supabase.from("menu_dishes").insert(
            menus.map((m) => ({
              menu_id: m.id,
              dish_id: dish.id,
              available_today: true,
            })),
          );
        }
      }
    }

    // Optimistic update
    setTodayDishIds((prev) => {
      const next = new Set(prev);
      if (isCurrentlyToday) {
        next.delete(dish.id);
      } else {
        next.add(dish.id);
      }
      return next;
    });
  }

  async function handleDuplicate(dish: Dish) {
    const { data: newDish, error } = await supabase
      .from("dishes")
      .insert({
        name_fr: `${dish.name_fr} (copie)`,
        name_en: dish.name_en,
        name_it: dish.name_it,
        name_es: dish.name_es,
        name_de: dish.name_de,
        description_fr: dish.description_fr,
        description_en: dish.description_en,
        description_it: dish.description_it,
        description_es: dish.description_es,
        description_de: dish.description_de,
        category: dish.category,
        source: dish.source,
        price: dish.price,
        available: true,
        sort_order: dish.sort_order + 1,
      })
      .select()
      .single();

    if (error) {
      console.error("Duplicate error:", error);
      return;
    }

    await refresh();
    setEditingDish(newDish as Dish);
    setSheetOpen(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.image_path) {
        await deleteDishImage(supabase, deleteTarget.image_path);
      }
      await deleteDish(supabase, deleteTarget.id);
      await refresh();
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  async function handleGenerateImage(dish: Dish) {
    setGeneratingId(dish.id);
    try {
      const res = await fetch("/api/admin/generate-dish-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dishId: dish.id }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(`Erreur : ${err.error}`);
        return;
      }
      setImageTimestamps((prev) => ({ ...prev, [dish.id]: Date.now() }));
      await refresh();
    } catch {
      alert("Erreur lors de la génération de l'image");
    } finally {
      setGeneratingId(null);
    }
  }

  // Filter dishes by source
  const filteredGroups = groups
    .map((g) => ({
      ...g,
      dishes:
        sourceFilter === "all"
          ? g.dishes
          : g.dishes.filter((d) => d.source === sourceFilter),
    }))
    .filter((g) => g.dishes.length > 0);

  const totalDishes = filteredGroups.reduce((sum, g) => sum + g.dishes.length, 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light tracking-wide">Gestion des plats</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalDishes} plat{totalDishes !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={handleAdd}>+ Ajouter un plat</Button>
      </div>

      {/* Source filter */}
      <div className="mt-4 flex gap-2">
        <Button
          variant={sourceFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setSourceFilter("all")}
        >
          Tout
        </Button>
        {DISH_SOURCES.map((s) => (
          <Button
            key={s.value}
            variant={sourceFilter === s.value ? "default" : "outline"}
            size="sm"
            onClick={() => setSourceFilter(s.value)}
          >
            {s.label}
          </Button>
        ))}
      </div>

      <Separator className="my-6" />

      {/* Dish list grouped by category */}
      {filteredGroups.map(({ category, label, dishes }) => (
        <section key={category} className="mb-8">
          <h2 className="mb-4 text-lg font-medium tracking-wide">{label}</h2>
          <div className="space-y-2">
            {dishes.map((dish) => (
              <DishRow
                key={dish.id}
                dish={dish}
                imageTs={imageTimestamps[dish.id]}
                isToday={todayDishIds.has(dish.id)}
                onEdit={() => handleEdit(dish)}
                onDuplicate={() => handleDuplicate(dish)}
                onDelete={() => setDeleteTarget(dish)}
                onToggle={() => handleToggleAvailable(dish)}
                onToggleToday={() => handleToggleToday(dish)}
                onGenerateImage={() => handleGenerateImage(dish)}
                onClickImage={(url) => setLightboxUrl(url)}
                generating={generatingId === dish.id}
                getImageUrl={(path) => getDishImageUrl(supabase, path)}
              />
            ))}
          </div>
        </section>
      ))}

      {filteredGroups.length === 0 && (
        <p className="py-12 text-center text-sm italic text-muted-foreground">
          Aucun plat trouvé.
        </p>
      )}

      {/* Add/Edit Sheet */}
      <DishFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        dish={editingDish}
        onSaved={async () => {
          setSheetOpen(false);
          await refresh();
        }}
        onRefresh={async (dishId?: string) => {
          if (dishId) {
            setImageTimestamps((prev) => ({ ...prev, [dishId]: Date.now() }));
          }
          await refresh();
        }}
      />

      {/* Image Lightbox */}
      <Dialog open={!!lightboxUrl} onOpenChange={() => setLightboxUrl(null)}>
        <DialogContent className="max-w-2xl border-none bg-transparent p-0 shadow-none">
          {lightboxUrl && (
            <Image
              src={lightboxUrl}
              alt="Photo du plat"
              width={1024}
              height={1024}
              className="h-auto w-full rounded-lg"
              unoptimized
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce plat ?</AlertDialogTitle>
            <AlertDialogDescription>
              «&nbsp;{deleteTarget?.name_fr}&nbsp;» sera supprimé définitivement. Cette action est
              irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Dish row component ──

type DishRowProps = {
  dish: Dish;
  imageTs?: number;
  isToday: boolean;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggle: () => void;
  onToggleToday: () => void;
  onGenerateImage: () => void;
  onClickImage: (url: string) => void;
  generating: boolean;
  getImageUrl: (path: string) => string;
};

function DishRow({ dish, onEdit, onDuplicate, onDelete, onToggle, onToggleToday, onGenerateImage, onClickImage, generating, getImageUrl, imageTs, isToday }: DishRowProps) {
  const sourceLabel = DISH_SOURCES.find((s) => s.value === dish.source)?.label;
  const rawUrl = dish.image_path ? getImageUrl(dish.image_path) : null;
  const imageUrl = rawUrl && imageTs ? `${rawUrl}?t=${imageTs}` : rawUrl;

  return (
    <div
      className={`flex items-center gap-4 rounded-lg border p-3 transition-colors ${
        !dish.available ? "opacity-50" : ""
      }`}
    >
      {/* Thumbnail */}
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
        {imageUrl ? (
          <button
            onClick={() => onClickImage(imageUrl)}
            className="relative h-full w-full cursor-zoom-in"
          >
            <Image
              src={imageUrl}
              alt={dish.name_fr}
              fill
              className="object-cover"
              sizes="48px"
              unoptimized={!!imageTs}
            />
          </button>
        ) : (
          <button
            onClick={onGenerateImage}
            disabled={generating}
            className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground hover:bg-muted/80"
            title="Générer une photo IA"
          >
            {generating ? "..." : "IA"}
          </button>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{dish.name_fr}</p>
          {sourceLabel && (
            <Badge variant="outline" className="shrink-0 text-[10px]">
              {sourceLabel}
            </Badge>
          )}
          {isToday && (
            <Badge variant="default" className="shrink-0 text-[10px] bg-green-600">
              Menu du jour
            </Badge>
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">{dish.description_fr}</p>
      </div>

      {/* Price */}
      <p className="shrink-0 text-sm font-medium">
        {Number(dish.price) > 0 ? `${Number(dish.price).toFixed(2)} €` : "—"}
      </p>

      {/* Today toggle */}
      <div className="flex shrink-0 flex-col items-center gap-0.5">
        <span className="text-[10px] text-muted-foreground">Jour</span>
        <Switch
          checked={isToday}
          onCheckedChange={onToggleToday}
          aria-label="Disponible au menu du jour"
        />
      </div>

      {/* Available toggle */}
      <Switch checked={dish.available} onCheckedChange={onToggle} aria-label="Disponible" />

      {/* Actions */}
      <div className="flex shrink-0 gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onGenerateImage}
          disabled={generating}
          title="Régénérer la photo avec DALL-E"
        >
          {generating ? "Génération..." : "IA"}
        </Button>
        <Button variant="ghost" size="sm" onClick={onDuplicate}>
          Dupliquer
        </Button>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          Modifier
        </Button>
        <Button variant="ghost" size="sm" className="text-destructive" onClick={onDelete}>
          Supprimer
        </Button>
      </div>
    </div>
  );
}
