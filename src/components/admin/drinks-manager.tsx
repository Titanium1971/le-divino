"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getDrinks, getDrinksGrouped, deleteDrink } from "@/lib/supabase/drinks";
import type { Drink, DrinkCategory } from "@/lib/types/database";
import { DRINK_CATEGORIES } from "@/lib/types/database";
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
import { DrinkFormSheet } from "./drink-form-sheet";

type Props = {
  initialDrinks: Drink[];
};

export function DrinksManager({ initialDrinks }: Props) {
  const supabase = createClient();
  const [drinks, setDrinks] = useState<Drink[]>(initialDrinks);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingDrink, setEditingDrink] = useState<Drink | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Drink | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<DrinkCategory | "all">("all");

  const refresh = useCallback(async () => {
    const data = await getDrinks(supabase);
    setDrinks(data);
  }, [supabase]);

  function handleAdd() {
    setEditingDrink(null);
    setSheetOpen(true);
  }

  function handleEdit(drink: Drink) {
    setEditingDrink(drink);
    setSheetOpen(true);
  }

  async function handleToggleAvailable(drink: Drink) {
    await supabase
      .from("drinks")
      .update({ available: !drink.available })
      .eq("id", drink.id);
    await refresh();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDrink(supabase, deleteTarget.id);
      await refresh();
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  const groups = getDrinksGrouped(drinks);
  const filteredGroups =
    categoryFilter === "all"
      ? groups.filter((g) => g.drinks.length > 0)
      : groups.filter((g) => g.category === categoryFilter && g.drinks.length > 0);

  const totalDrinks = filteredGroups.reduce((sum, g) => sum + g.drinks.length, 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light tracking-wide">Carte des boissons</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalDrinks} boisson{totalDrinks !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={handleAdd}>+ Ajouter une boisson</Button>
      </div>

      {/* Category filter */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          variant={categoryFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setCategoryFilter("all")}
        >
          Tout
        </Button>
        {DRINK_CATEGORIES.map((c) => (
          <Button
            key={c.value}
            variant={categoryFilter === c.value ? "default" : "outline"}
            size="sm"
            onClick={() => setCategoryFilter(c.value)}
          >
            {c.label}
          </Button>
        ))}
      </div>

      <Separator className="my-6" />

      {/* Drink list grouped by category */}
      {filteredGroups.map(({ category, label, drinks: groupDrinks }) => (
        <section key={category} className="mb-8">
          <h2 className="mb-4 text-lg font-medium tracking-wide">{label}</h2>
          <div className="space-y-2">
            {groupDrinks.map((drink) => (
              <DrinkRow
                key={drink.id}
                drink={drink}
                onEdit={() => handleEdit(drink)}
                onDelete={() => setDeleteTarget(drink)}
                onToggle={() => handleToggleAvailable(drink)}
              />
            ))}
          </div>
        </section>
      ))}

      {filteredGroups.length === 0 && (
        <p className="py-12 text-center text-sm italic text-muted-foreground">
          Aucune boisson trouvée.
        </p>
      )}

      {/* Add/Edit Sheet */}
      <DrinkFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        drink={editingDrink}
        onSaved={async () => {
          setSheetOpen(false);
          await refresh();
        }}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette boisson ?</AlertDialogTitle>
            <AlertDialogDescription>
              «&nbsp;{deleteTarget?.name}&nbsp;» sera supprimé définitivement. Cette action est
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

// ── Drink row component ──

type DrinkRowProps = {
  drink: Drink;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
};

function DrinkRow({ drink, onEdit, onDelete, onToggle }: DrinkRowProps) {
  const categoryLabel = DRINK_CATEGORIES.find((c) => c.value === drink.category)?.label;

  return (
    <div
      className={`flex items-center gap-4 rounded-lg border p-3 transition-colors ${
        !drink.available ? "opacity-50" : ""
      }`}
    >
      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{drink.name}</p>
          {categoryLabel && (
            <Badge variant="outline" className="shrink-0 text-[10px]">
              {categoryLabel}
            </Badge>
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">{drink.description_fr}</p>
      </div>

      {/* Price */}
      <p className="shrink-0 text-sm font-medium">
        {drink.price != null && Number(drink.price) > 0
          ? `${Number(drink.price).toFixed(2)} €`
          : "—"}
      </p>

      {/* Available toggle */}
      <Switch checked={drink.available} onCheckedChange={onToggle} aria-label="Disponible" />

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
