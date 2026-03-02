"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getMenus, deleteMenu, updateMenu } from "@/lib/supabase/menus";
import type { Category, Dish, Menu } from "@/lib/types/database";
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
import { MenuFormSheet } from "./menu-form-sheet";

type DishGroup = { category: Category; dishes: Dish[] };

type Props = {
  initialMenus: Menu[];
  dishGroups: DishGroup[];
};

export function MenusManager({ initialMenus, dishGroups }: Props) {
  const supabase = createClient();
  const [menus, setMenus] = useState<Menu[]>(initialMenus);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Menu | null>(null);
  const [deleting, setDeleting] = useState(false);

  const refresh = useCallback(async () => {
    const data = await getMenus(supabase);
    setMenus(data);
  }, [supabase]);

  function handleAdd() {
    setEditingMenu(null);
    setSheetOpen(true);
  }

  function handleEdit(menu: Menu) {
    setEditingMenu(menu);
    setSheetOpen(true);
  }

  async function handleToggleAvailable(menu: Menu) {
    await updateMenu(supabase, menu.id, { available: !menu.available });
    await refresh();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteMenu(supabase, deleteTarget.id);
      await refresh();
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light tracking-wide">Gestion des menus</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {menus.length} menu{menus.length !== 1 ? "s" : ""} / formule
            {menus.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={handleAdd}>+ Ajouter un menu</Button>
      </div>

      <Separator className="my-6" />

      {/* Menu list */}
      {menus.length === 0 ? (
        <p className="text-sm italic text-muted-foreground">Aucun menu pour le moment.</p>
      ) : (
        <div className="space-y-2">
          {menus.map((menu) => (
            <div
              key={menu.id}
              className={`flex items-center gap-4 rounded-lg border p-4 transition-colors ${
                !menu.available ? "opacity-50" : ""
              }`}
            >
              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium">{menu.name.fr}</p>
                  <Badge variant="secondary" className="shrink-0 text-[10px]">
                    {menu.courses?.length ?? 0} service{(menu.courses?.length ?? 0) !== 1 ? "s" : ""}
                  </Badge>
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {menu.description?.fr}
                </p>
              </div>

              {/* Price */}
              <p className="shrink-0 text-sm font-medium">
                {Number(menu.price).toFixed(2)}&nbsp;€
              </p>

              {/* Available toggle */}
              <Switch
                checked={menu.available}
                onCheckedChange={() => handleToggleAvailable(menu)}
                aria-label="Disponible"
              />

              {/* Actions */}
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(menu)}>
                  Modifier
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => setDeleteTarget(menu)}
                >
                  Supprimer
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Sheet */}
      <MenuFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        menu={editingMenu}
        dishGroups={dishGroups}
        onSaved={async () => {
          setSheetOpen(false);
          await refresh();
        }}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce menu ?</AlertDialogTitle>
            <AlertDialogDescription>
              «&nbsp;{deleteTarget?.name?.fr}&nbsp;» sera supprimé
              définitivement. Cette action est irréversible.
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
