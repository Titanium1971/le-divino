"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  getAllCategories,
  deleteCategory,
  updateCategorySortOrders,
} from "@/lib/supabase/dishes";
import type { Category, Dish } from "@/lib/types/database";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { CategoryFormDialog } from "./category-form-dialog";

type DishGroup = { category: Category; dishes: Dish[] };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCategories: Category[];
  dishGroups: DishGroup[];
  onCategoriesChanged: () => Promise<void>;
};

export function CategoriesSheet({
  open,
  onOpenChange,
  initialCategories,
  dishGroups,
  onCategoriesChanged,
}: Props) {
  const supabase = createClient();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const refresh = useCallback(async () => {
    const data = await getAllCategories(supabase);
    setCategories(data);
    await onCategoriesChanged();
  }, [supabase, onCategoriesChanged]);

  // Keep categories synced when sheet opens
  useState(() => {
    setCategories(initialCategories);
  });

  function dishCountForCategory(categoryId: string): number {
    return dishGroups.find((g) => g.category.id === categoryId)?.dishes.length ?? 0;
  }

  function handleAdd() {
    setEditingCategory(null);
    setFormOpen(true);
  }

  function handleEdit(category: Category) {
    setEditingCategory(category);
    setFormOpen(true);
  }

  async function handleToggleVisible(category: Category) {
    const { updateCategory } = await import("@/lib/supabase/dishes");
    await updateCategory(supabase, category.id, { visible: !category.visible });
    await refresh();
  }

  async function handleMove(index: number, direction: "up" | "down") {
    const newCategories = [...categories];
    const swapIdx = direction === "up" ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= newCategories.length) return;

    [newCategories[index], newCategories[swapIdx]] = [newCategories[swapIdx], newCategories[index]];

    const updates = newCategories.map((c, i) => ({ id: c.id, sort_order: i + 1 }));
    setCategories(newCategories);
    await updateCategorySortOrders(supabase, updates);
    await onCategoriesChanged();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCategory(supabase, deleteTarget.id);
      await refresh();
    } catch (err) {
      // Cascade delete will remove dishes — this is expected
      console.error(err);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Gérer les catégories</SheetTitle>
            <SheetDescription>
              Organisez les catégories de votre carte. L&apos;ordre ci-dessous
              détermine l&apos;affichage.
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-12rem)] pr-4">
            <div className="space-y-2 pb-4 pt-4">
              {categories.map((cat, idx) => (
                <div
                  key={cat.id}
                  className={`flex items-center gap-2 rounded-md border p-3 ${
                    !cat.visible ? "opacity-50" : ""
                  }`}
                >
                  {/* Reorder arrows */}
                  <div className="flex shrink-0 flex-col gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, "up")}
                    >
                      &#9650;
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      disabled={idx === categories.length - 1}
                      onClick={() => handleMove(idx, "down")}
                    >
                      &#9660;
                    </Button>
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {cat.slug} · {dishCountForCategory(cat.id)} plat
                      {dishCountForCategory(cat.id) !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {/* Visible toggle */}
                  <Switch
                    checked={cat.visible}
                    onCheckedChange={() => handleToggleVisible(cat)}
                    aria-label="Visible"
                  />

                  {/* Actions */}
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(cat)}>
                    Modifier
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => setDeleteTarget(cat)}
                  >
                    Supprimer
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="border-t pt-4">
            <Button onClick={handleAdd} className="w-full">
              + Ajouter une catégorie
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Category form dialog */}
      <CategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editingCategory}
        onSaved={refresh}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette catégorie ?</AlertDialogTitle>
            <AlertDialogDescription>
              «&nbsp;{deleteTarget?.name}&nbsp;» sera supprimée
              définitivement.
              {deleteTarget && dishCountForCategory(deleteTarget.id) > 0 && (
                <>
                  {" "}
                  <strong>
                    Attention : {dishCountForCategory(deleteTarget.id)} plat
                    {dishCountForCategory(deleteTarget.id) !== 1 ? "s" : ""} seront
                    également supprimés.
                  </strong>
                </>
              )}
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
    </>
  );
}
