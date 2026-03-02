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
import type { Category, Dish } from "@/lib/types/database";
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

  const totalDishes = groups.reduce((sum, g) => sum + g.dishes.length, 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light tracking-wide">Gestion des plats</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalDishes} plat{totalDishes !== 1 ? "s" : ""} dans {groups.length} catégorie
            {groups.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCategoriesOpen(true)}>
            Gérer les catégories
          </Button>
          <Button onClick={handleAdd}>+ Ajouter un plat</Button>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Dish list grouped by category */}
      {groups.map(({ category, dishes }) => (
        <section key={category.id} className="mb-8">
          <h2 className="mb-4 text-lg font-medium tracking-wide">{category.name}</h2>
          {dishes.length === 0 ? (
            <p className="text-sm italic text-muted-foreground">Aucun plat dans cette catégorie.</p>
          ) : (
            <div className="space-y-2">
              {dishes.map((dish) => (
                <DishRow
                  key={dish.id}
                  dish={dish}
                  supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL!}
                  onEdit={() => handleEdit(dish)}
                  onDelete={() => setDeleteTarget(dish)}
                  onToggle={() => handleToggleAvailable(dish)}
                  getImageUrl={(path) => getDishImageUrl(supabase, path)}
                />
              ))}
            </div>
          )}
        </section>
      ))}

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
  getImageUrl: (path: string) => string;
};

function DishRow({ dish, onEdit, onDelete, onToggle, getImageUrl }: DishRowProps) {
  return (
    <div
      className={`flex items-center gap-4 rounded-lg border p-3 transition-colors ${
        !dish.available ? "opacity-50" : ""
      }`}
    >
      {/* Thumbnail */}
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
        {dish.image_path && (
          <Image
            src={getImageUrl(dish.image_path)}
            alt={dish.name.fr}
            fill
            className="object-cover"
            sizes="48px"
          />
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
        </div>
        <p className="truncate text-xs text-muted-foreground">{dish.description?.fr}</p>
      </div>

      {/* Price */}
      <p className="shrink-0 text-sm font-medium">{Number(dish.price).toFixed(2)}&nbsp;€</p>

      {/* Available toggle */}
      <Switch checked={dish.available} onCheckedChange={onToggle} aria-label="Disponible" />

      {/* Actions */}
      <div className="flex shrink-0 gap-1">
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
