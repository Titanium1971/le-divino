"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getMenus, deleteMenu, updateMenu, getMenuDishes } from "@/lib/supabase/menus";
import { logActivity } from "@/lib/supabase/activity-log";
import type { Menu, MenuDish } from "@/lib/types/database";
import { MENU_TYPES } from "@/lib/types/database";
import type { DishGroup } from "@/lib/supabase/dishes";
import { getDishesGrouped } from "@/lib/supabase/dishes";
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

type Props = {
  initialMenus: Menu[];
  dishGroups: DishGroup[];
};

export function MenusManager({ initialMenus, dishGroups: initialDishGroups }: Props) {
  const supabase = createClient();
  const [menus, setMenus] = useState<Menu[]>(initialMenus);
  const [dishGroups, setDishGroups] = useState<DishGroup[]>(initialDishGroups);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [editingMenuDishes, setEditingMenuDishes] = useState<MenuDish[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Menu | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [menuDishCounts, setMenuDishCounts] = useState<Record<string, number>>({});

  const refresh = useCallback(async () => {
    const [data, groups] = await Promise.all([
      getMenus(supabase),
      getDishesGrouped(supabase),
    ]);
    setMenus(data);
    setDishGroups(
      groups
        .map((g) => ({ ...g, dishes: g.dishes.filter((d) => d.available) }))
        .filter((g) => g.dishes.length > 0),
    );
    // Refresh dish counts for all menus
    const counts: Record<string, number> = {};
    for (const m of data) {
      const md = await getMenuDishes(supabase, m.id);
      counts[m.id] = md.length;
    }
    setMenuDishCounts(counts);
  }, [supabase]);

  // Load dish counts on mount
  useState(() => {
    (async () => {
      const counts: Record<string, number> = {};
      for (const m of initialMenus) {
        const md = await getMenuDishes(supabase, m.id);
        counts[m.id] = md.length;
      }
      setMenuDishCounts(counts);
    })();
  });

  function handleAdd() {
    setEditingMenu(null);
    setEditingMenuDishes([]);
    setSheetOpen(true);
  }

  async function handleEdit(menu: Menu) {
    const md = await getMenuDishes(supabase, menu.id);
    setEditingMenu(menu);
    setEditingMenuDishes(md);
    setSheetOpen(true);
  }

  async function handleToggleActive(menu: Menu) {
    await updateMenu(supabase, menu.id, { active: !menu.active });
    await logActivity(supabase, {
      action: "UPDATE",
      entityType: "menu",
      entityId: menu.id,
      entityName: menu.name_fr,
      details: { field: "active", value: !menu.active },
    });
    await refresh();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteMenu(supabase, deleteTarget.id);
      await logActivity(supabase, {
        action: "DELETE",
        entityType: "menu",
        entityId: deleteTarget.id,
        entityName: deleteTarget.name_fr,
      });
      await refresh();
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-light tracking-wide sm:text-2xl">Gestion des menus</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {menus.length} menu{menus.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={handleAdd} className="w-full sm:w-auto">+ Ajouter un menu</Button>
      </div>

      <Separator className="my-6" />

      {/* Menu list */}
      {menus.length === 0 ? (
        <p className="text-sm italic text-muted-foreground">Aucun menu pour le moment.</p>
      ) : (
        <div className="space-y-2">
          {menus.map((menu) => {
            const typeLabel = MENU_TYPES.find((t) => t.value === menu.type)?.label;
            const dishCount = menuDishCounts[menu.id] ?? 0;
            return (
              <div
                key={menu.id}
                className={`rounded-lg border p-4 transition-colors ${
                  !menu.active ? "opacity-50" : ""
                }`}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                      <p className="truncate text-sm font-medium">{menu.name_fr}</p>
                      {typeLabel && (
                        <Badge variant="secondary" className="shrink-0 text-[10px]">
                          {typeLabel}
                        </Badge>
                      )}
                      <Badge variant="outline" className="shrink-0 text-[10px]">
                        {dishCount} plat{dishCount !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {menu.description_fr}
                    </p>
                  </div>

                  <p className="shrink-0 text-sm font-medium">
                    {Number(menu.price).toFixed(2)}&nbsp;€
                  </p>

                  <Switch
                    checked={menu.active}
                    onCheckedChange={() => handleToggleActive(menu)}
                    aria-label="Actif"
                  />
                </div>

                <div className="mt-2 flex flex-wrap gap-1 sm:mt-0 sm:justify-end">
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
            );
          })}
        </div>
      )}

      {/* Add/Edit Sheet */}
      <MenuFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        menu={editingMenu}
        menuDishes={editingMenuDishes}
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
              «&nbsp;{deleteTarget?.name_fr}&nbsp;» sera supprimé
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
