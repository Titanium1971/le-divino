"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import {
  getDishesGrouped,
  deleteDish,
  deleteDishImage,
  getDishImageUrl,
} from "@/lib/supabase/dishes";
import type { Category, Dish, MenuType } from "@/lib/types/database";
import { MENU_TYPES } from "@/lib/types/database";
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
import { CategoriesSheet } from "./categories-sheet";

type DishGroup = { category: Category; dishes: Dish[] };

type Props = {
  initialGroups: DishGroup[];
  categories: Category[];
};

export function DishesManager({ initialGroups, categories }: Props) {
  const supabase = createClient();
  const [groups, setGroups] = useState<DishGroup[]>(initialGroups);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Dish | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [menuFilter, setMenuFilter] = useState<MenuType | "all">("all");
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const data = await getDishesGrouped(supabase);
    setGroups(data);
  }, [supabase]);

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
      await refresh();
    } catch {
      alert("Erreur lors de la génération de l'image");
    } finally {
      setGeneratingId(null);
    }
  }

  // Filter dishes by menu_type
  const filteredGroups = groups
    .map((g) => ({
      ...g,
      dishes:
        menuFilter === "all"
          ? g.dishes
          : g.dishes.filter((d) => d.menu_type === menuFilter),
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
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCategoriesOpen(true)}>
            Catégories
          </Button>
          <Button onClick={handleAdd}>+ Ajouter un plat</Button>
        </div>
      </div>

      {/* Menu type filter */}
      <div className="mt-4 flex gap-2">
        <Button
          variant={menuFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setMenuFilter("all")}
        >
          Tout
        </Button>
        {MENU_TYPES.map((mt) => (
          <Button
            key={mt.value}
            variant={menuFilter === mt.value ? "default" : "outline"}
            size="sm"
            onClick={() => setMenuFilter(mt.value)}
          >
            {mt.label}
          </Button>
        ))}
      </div>

      <Separator className="my-6" />

      {/* Dish list grouped by category */}
      {filteredGroups.map(({ category, dishes }) => (
        <section key={category.id} className="mb-8">
          <h2 className="mb-4 text-lg font-medium tracking-wide">{category.name}</h2>
          <div className="space-y-2">
            {dishes.map((dish) => (
              <DishRow
                key={dish.id}
                dish={dish}
                supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL!}
                onEdit={() => handleEdit(dish)}
                onDelete={() => setDeleteTarget(dish)}
                onToggle={() => handleToggleAvailable(dish)}
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
        categories={categories}
        onSaved={async () => {
          setSheetOpen(false);
          await refresh();
        }}
      />

      {/* Categories Sheet */}
      <CategoriesSheet
        open={categoriesOpen}
        onOpenChange={setCategoriesOpen}
        initialCategories={categories}
        dishGroups={groups}
        onCategoriesChanged={refresh}
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
              «&nbsp;{deleteTarget?.name?.fr}&nbsp;» sera supprimé définitivement. Cette action est
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
  supabaseUrl: string;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  onGenerateImage: () => void;
  onClickImage: (url: string) => void;
  generating: boolean;
  getImageUrl: (path: string) => string;
};

function DishRow({ dish, onEdit, onDelete, onToggle, onGenerateImage, onClickImage, generating, getImageUrl }: DishRowProps) {
  const menuLabel = MENU_TYPES.find((mt) => mt.value === dish.menu_type)?.label;
  const imageUrl = dish.image_path ? getImageUrl(dish.image_path) : null;

  return (
    <div
      className={`flex items-center gap-4 rounded-lg border p-3 transition-colors ${
        !dish.available ? "opacity-50" : ""
      }`}
    >
      {/* Thumbnail — clickable to open lightbox */}
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
        {imageUrl ? (
          <button
            onClick={() => onClickImage(imageUrl)}
            className="relative h-full w-full cursor-zoom-in"
          >
            <Image
              src={imageUrl}
              alt={dish.name.fr}
              fill
              className="object-cover"
              sizes="48px"
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
          <p className="truncate text-sm font-medium">{dish.name.fr}</p>
          {dish.is_signature && (
            <Badge variant="secondary" className="shrink-0 text-[10px]">
              Signature
            </Badge>
          )}
          {menuLabel && (
            <Badge variant="outline" className="shrink-0 text-[10px]">
              {menuLabel}
            </Badge>
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">{dish.description?.fr}</p>
      </div>

      {/* Price */}
      <p className="shrink-0 text-sm font-medium">
        {Number(dish.price) > 0 ? `${Number(dish.price).toFixed(2)} €` : "—"}
      </p>

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
          {generating ? "Génération..." : "📷 IA"}
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
