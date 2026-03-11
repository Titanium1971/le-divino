"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getMenus, getAllMenuDishes, addDishToMenu, removeDishFromMenu, toggleAvailableToday } from "@/lib/supabase/menus";
import { getAllDishes } from "@/lib/supabase/dishes";
import type { Menu, MenuDish, Dish, DishCategory } from "@/lib/types/database";
import { MENU_TYPES, DISH_CATEGORIES } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

type Props = {
  initialMenus: Menu[];
  initialDishes: Dish[];
  initialMenuDishes: MenuDish[];
};

export function FormulesManager({ initialMenus, initialDishes, initialMenuDishes }: Props) {
  const supabase = createClient();
  const [menus, setMenus] = useState<Menu[]>(initialMenus);
  const [dishes, setDishes] = useState<Dish[]>(initialDishes);
  const [menuDishes, setMenuDishes] = useState<MenuDish[]>(initialMenuDishes);
  const [selectedMenuId, setSelectedMenuId] = useState<string>(initialMenus[0]?.id ?? "");

  const refresh = useCallback(async () => {
    const [m, d, md] = await Promise.all([
      getMenus(supabase),
      getAllDishes(supabase),
      getAllMenuDishes(supabase),
    ]);
    setMenus(m);
    setDishes(d);
    setMenuDishes(md);
  }, [supabase]);

  const selectedMenu = menus.find((m) => m.id === selectedMenuId);
  const menuDishesForSelected = menuDishes.filter((md) => md.menu_id === selectedMenuId);
  const assignedDishIds = new Set(menuDishesForSelected.map((md) => md.dish_id));

  // Get the categories relevant to the selected menu type
  function getCategoriesForMenuType(type: string): DishCategory[] {
    switch (type) {
      case "entree_plat": return ["entree", "plat"];
      case "plat_dessert": return ["plat", "dessert"];
      case "entree_plat_dessert": return ["entree", "plat", "dessert"];
      default: return ["entree", "plat", "dessert"];
    }
  }

  const relevantCategories = selectedMenu ? getCategoriesForMenuType(selectedMenu.type) : [];

  // Only show "marche" dishes for formules
  const marcheDishes = dishes.filter((d) => d.source === "marche");

  async function handleToggleDish(dishId: string) {
    if (assignedDishIds.has(dishId)) {
      await removeDishFromMenu(supabase, selectedMenuId, dishId);
    } else {
      await addDishToMenu(supabase, selectedMenuId, dishId);
    }
    await refresh();
  }

  async function handleToggleAvailableToday(menuDish: MenuDish) {
    await toggleAvailableToday(supabase, menuDish.id, !menuDish.available_today);
    await refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light tracking-wide">Formules du jour</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Assignez les plats du marché aux formules et activez la disponibilité du jour
          </p>
        </div>
      </div>

      {/* Menu selector */}
      <div className="mt-4 flex gap-2">
        {menus.filter((m) => m.active).map((menu) => {
          const typeLabel = MENU_TYPES.find((t) => t.value === menu.type)?.label;
          return (
            <Button
              key={menu.id}
              variant={selectedMenuId === menu.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedMenuId(menu.id)}
            >
              {menu.name_fr}
              {typeLabel && <span className="ml-1 text-xs opacity-70">({typeLabel})</span>}
            </Button>
          );
        })}
      </div>

      <Separator className="my-6" />

      {!selectedMenu ? (
        <p className="text-sm italic text-muted-foreground">
          Aucun menu actif. Créez un menu dans la section Menus.
        </p>
      ) : (
        <div className="space-y-8">
          {relevantCategories.map((cat) => {
            const catLabel = DISH_CATEGORIES.find((c) => c.value === cat)?.label ?? cat;
            const catDishes = marcheDishes.filter((d) => d.category === cat);

            if (catDishes.length === 0) return null;

            return (
              <section key={cat}>
                <h2 className="mb-3 text-lg font-medium tracking-wide">{catLabel}</h2>
                <div className="space-y-1">
                  {catDishes.map((dish) => {
                    const isAssigned = assignedDishIds.has(dish.id);
                    const menuDish = menuDishesForSelected.find((md) => md.dish_id === dish.id);

                    return (
                      <div
                        key={dish.id}
                        className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                          !isAssigned ? "opacity-50" : ""
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{dish.name_fr}</p>
                          {dish.description_fr && (
                            <p className="truncate text-xs text-muted-foreground">{dish.description_fr}</p>
                          )}
                        </div>

                        {/* Assign/remove from menu */}
                        <Badge
                          variant={isAssigned ? "default" : "outline"}
                          className="shrink-0 cursor-pointer select-none"
                          onClick={() => handleToggleDish(dish.id)}
                        >
                          {isAssigned ? "Assigné" : "Ajouter"}
                        </Badge>

                        {/* Available today toggle (only if assigned) */}
                        {isAssigned && menuDish && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Dispo</span>
                            <Switch
                              checked={menuDish.available_today}
                              onCheckedChange={() => handleToggleAvailableToday(menuDish)}
                              aria-label="Disponible aujourd'hui"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
