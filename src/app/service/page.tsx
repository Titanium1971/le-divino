"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Dish, Drink, Wine, DishCategory, DrinkCategory, WineColor } from "@/lib/types/database";
import { DISH_CATEGORIES, DRINK_CATEGORIES, WINE_COLORS } from "@/lib/types/database";
import { Button } from "@/components/ui/button";

type DishGroup = { category: DishCategory; label: string; dishes: Dish[] };

export default function ServicePage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [verifying, setVerifying] = useState(false);

  async function handleVerifyPin() {
    if (!pin) return;
    setVerifying(true);
    setPinError(false);
    try {
      const res = await fetch("/api/service/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (data.success) {
        setAuthenticated(true);
      } else {
        setPinError(true);
        setPin("");
      }
    } catch {
      setPinError(true);
    } finally {
      setVerifying(false);
    }
  }

  function handlePinDigit(digit: string) {
    if (pin.length < 6) {
      setPin((prev) => prev + digit);
      setPinError(false);
    }
  }

  function handlePinBackspace() {
    setPin((prev) => prev.slice(0, -1));
    setPinError(false);
  }

  // Auto-submit when 4 digits entered
  useEffect(() => {
    if (pin.length === 4) {
      handleVerifyPin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  if (!authenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="mb-2 text-2xl font-light tracking-wide">Service</h1>
        <p className="mb-8 text-sm text-muted-foreground">Entrez le code PIN pour accéder</p>

        {/* PIN display */}
        <div className="mb-6 flex gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`flex h-14 w-14 items-center justify-center rounded-lg border-2 text-2xl font-medium ${
                i < pin.length ? "border-foreground" : "border-muted"
              } ${pinError ? "border-destructive" : ""}`}
            >
              {i < pin.length ? "\u2022" : ""}
            </div>
          ))}
        </div>

        {pinError && (
          <p className="mb-4 text-sm text-destructive">Code PIN incorrect</p>
        )}

        {/* Number pad */}
        <div className="grid w-64 grid-cols-3 gap-2">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "\u232B"].map(
            (digit, i) => {
              if (digit === "") return <div key={i} />;
              if (digit === "\u232B") {
                return (
                  <Button
                    key={i}
                    variant="outline"
                    className="h-14 text-xl"
                    onClick={handlePinBackspace}
                    disabled={verifying}
                  >
                    {digit}
                  </Button>
                );
              }
              return (
                <Button
                  key={i}
                  variant="outline"
                  className="h-14 text-xl"
                  onClick={() => handlePinDigit(digit)}
                  disabled={verifying}
                >
                  {digit}
                </Button>
              );
            },
          )}
        </div>
      </div>
    );
  }

  return <ServiceDashboard onLock={() => { setAuthenticated(false); setPin(""); }} />;
}

// ── Service Dashboard with tabs ──

function ServiceDashboard({ onLock }: { onLock: () => void }) {
  const [tab, setTab] = useState<"cuisine" | "traducteur">("cuisine");

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b bg-background px-4 py-2">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setTab("cuisine")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === "cuisine"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Cuisine
          </button>
          <button
            type="button"
            onClick={() => setTab("traducteur")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === "traducteur"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            N° Articles
          </button>
        </div>
        <Button variant="outline" size="sm" onClick={onLock}>
          Verrouiller
        </Button>
      </div>

      {tab === "cuisine" ? (
        <KitchenDashboard onLock={onLock} />
      ) : (
        <NumberedReference onLock={onLock} />
      )}
    </div>
  );
}

// ── Kitchen Dashboard ──

function KitchenDashboard({ onLock }: { onLock?: () => void }) {
  const supabase = createClient();
  const [groups, setGroups] = useState<DishGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDishes = useCallback(async () => {
    const { data, error } = await supabase
      .from("dishes")
      .select("*")
      .order("sort_order");

    if (error) return;

    const dishes = (data ?? []) as Dish[];

    setGroups(
      DISH_CATEGORIES.map(({ value, label }) => ({
        category: value,
        label,
        dishes: dishes.filter((d) => d.category === value),
      })).filter((g) => g.dishes.length > 0),
    );
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchDishes();
  }, [fetchDishes]);

  // Supabase Realtime subscription — fallback to polling if WebSocket fails
  // (iOS Safari with Lockdown Mode / restrictive content blockers throws
  // synchronously: "WebSocket not available: The operation is insecure").
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    try {
      channel = supabase
        .channel("dishes-realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "dishes" },
          () => {
            fetchDishes();
          },
        )
        .subscribe();
    } catch {
      pollTimer = setInterval(fetchDishes, 5000);
    }

    return () => {
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch {
          // Ignore — channel may already be torn down.
        }
      }
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [supabase, fetchDishes]);

  async function handleToggle(dish: Dish) {
    await supabase
      .from("dishes")
      .update({ available: !dish.available })
      .eq("id", dish.id);
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        dishes: g.dishes.map((d) =>
          d.id === dish.id ? { ...d, available: !d.available } : d,
        ),
      })),
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Dish toggles grouped by category */}
      {groups.map(({ category, label, dishes }) => (
        <section key={category} className="mb-6">
          <h2 className="sticky top-0 z-10 mb-2 bg-background py-2 text-base font-medium tracking-wide border-b">
            {label}
          </h2>
          <div className="space-y-1">
            {dishes.map((dish) => (
              <button
                key={dish.id}
                type="button"
                onClick={() => handleToggle(dish)}
                className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                  dish.available
                    ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950"
                    : "border-red-200 bg-red-50 opacity-60 dark:border-red-900 dark:bg-red-950"
                }`}
                style={{ minHeight: 48 }}
              >
                <span className="text-sm font-medium">{dish.name_fr}</span>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                    dish.available
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }`}
                >
                  {dish.available ? "Disponible" : "Indisponible"}
                </span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

// ── Numbered Reference (mirrors QR menu numbering) ──

const CATEGORY_LABELS: Record<string, string> = {
  entree: "Entrées",
  plat: "Plats",
  dessert: "Desserts",
};

const DRINK_CAT_LABELS: Record<DrinkCategory, string> = {
  soft: "Softs",
  cocktail: "Cocktails",
  biere: "Bières",
  biere_pression: "Bières Pression",
  biere_bouteille: "Bières Bouteille",
  spiritueux: "Spiritueux",
  hot: "Boissons Chaudes",
  autre: "Autres",
};

const WINE_COLOR_LABELS: Record<WineColor, string> = {
  rouge: "Rouge",
  blanc: "Blanc",
  "rosé": "Rosé",
  petillant: "Pétillant",
};

const CATEGORY_ORDER: DishCategory[] = ["entree", "plat", "dessert"];

function NumberedReference({ onLock }: { onLock?: () => void }) {
  const supabase = createClient();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<"plats" | "boissons" | "vins">("plats");
  const [searchNum, setSearchNum] = useState("");

  useEffect(() => {
    async function fetchAll() {
      const [dishRes, drinkRes, wineRes, menuDishRes] = await Promise.all([
        supabase.from("dishes").select("*").eq("available", true).order("sort_order"),
        supabase.from("drinks").select("*").eq("available", true).order("sort_order"),
        supabase.from("wines").select("*").eq("available", true).order("sort_order"),
        supabase.from("menus").select("menu_dishes(dishes(*))").eq("active", true),
      ]);
      // Merge available dishes + menu-only dishes (not available but in active menus)
      const availableDishes = (dishRes.data ?? []) as Dish[];
      const availableIds = new Set(availableDishes.map(d => d.id));
      const menuOnlyDishes: Dish[] = [];
      for (const menu of (menuDishRes.data ?? []) as unknown as { menu_dishes: { dishes: Dish | null }[] }[]) {
        for (const md of menu.menu_dishes ?? []) {
          const dish = md.dishes;
          if (dish && !availableIds.has(dish.id)) {
            availableIds.add(dish.id);
            menuOnlyDishes.push(dish);
          }
        }
      }
      setDishes([...availableDishes, ...menuOnlyDishes]);
      setDrinks((drinkRes.data ?? []) as Drink[]);
      setWines((wineRes.data ?? []) as Wine[]);
      setLoading(false);
    }
    fetchAll();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  // Group dishes: available carte first, then available marché, then menu-only
  const carteDishes = dishes.filter((d) => d.available && d.source === "carte");
  const marcheDishes = dishes.filter((d) => d.available && d.source === "marche");
  const menuOnlyDishes = dishes.filter((d) => !d.available);

  const carteGroups = CATEGORY_ORDER
    .map((cat) => ({ category: cat, items: carteDishes.filter((d) => d.category === cat) }))
    .filter((g) => g.items.length > 0);
  const marcheGroups = CATEGORY_ORDER
    .map((cat) => ({ category: cat, items: marcheDishes.filter((d) => d.category === cat) }))
    .filter((g) => g.items.length > 0);

  // Number carte dishes first, then marché
  let dishNum = 1;
  const numberedDishes: { num: number; name: string; price: number; category: DishCategory; source: string }[] = [];
  const seenIds = new Set<string>();
  for (const group of carteGroups) {
    for (const dish of group.items) {
      numberedDishes.push({ num: dishNum++, name: dish.name_fr, price: dish.price, category: dish.category, source: "carte" });
      seenIds.add(dish.id);
    }
  }
  for (const group of marcheGroups) {
    for (const dish of group.items) {
      if (!seenIds.has(dish.id)) {
        numberedDishes.push({ num: dishNum++, name: dish.name_fr, price: dish.price, category: dish.category, source: "marche" });
        seenIds.add(dish.id);
      }
    }
  }
  // Menu-only dishes (not available but linked to active menus)
  for (const dish of menuOnlyDishes) {
    if (!seenIds.has(dish.id)) {
      numberedDishes.push({ num: dishNum++, name: dish.name_fr, price: dish.price, category: dish.category, source: "menu" });
      seenIds.add(dish.id);
    }
  }

  const dishGroups = CATEGORY_ORDER
    .map((cat) => ({ category: cat, items: numberedDishes.filter((d) => d.category === cat) }))
    .filter((g) => g.items.length > 0);

  // Group drinks by category (same order as QR)
  const drinkCatOrder: DrinkCategory[] = ["soft", "cocktail", "biere_pression", "biere_bouteille", "spiritueux", "hot", "autre"];
  const drinkGroups = drinkCatOrder
    .map((cat) => ({ category: cat, items: drinks.filter((d) => d.category === cat) }))
    .filter((g) => g.items.length > 0);

  let drinkNum = dishNum;
  const numberedDrinks: { num: number; name: string; price: number | null; category: DrinkCategory }[] = [];
  for (const group of drinkGroups) {
    for (const drink of group.items) {
      numberedDrinks.push({ num: drinkNum++, name: drink.name, price: drink.price, category: drink.category });
    }
  }

  // Group wines by color
  const wineColorOrder: WineColor[] = ["rouge", "blanc", "rosé", "petillant"];
  const wineGroups = wineColorOrder
    .map((color) => ({ color, items: wines.filter((w) => w.color === color) }))
    .filter((g) => g.items.length > 0);

  let wineNum = drinkNum;
  const numberedWines: { num: number; name: string; color: WineColor }[] = [];
  for (const group of wineGroups) {
    for (const wine of group.items) {
      numberedWines.push({ num: wineNum++, name: wine.name, color: wine.color });
    }
  }

  // Search by number
  const searchN = searchNum ? parseInt(searchNum, 10) : null;

  return (
    <div className="p-4">
      {/* Quick number search */}
      <div className="sticky top-12 z-10 bg-background pb-3 pt-1">
        <div className="relative">
          <input
            type="number"
            inputMode="numeric"
            value={searchNum}
            onChange={(e) => setSearchNum(e.target.value)}
            placeholder="Numéro du plat..."
            className="w-full rounded-lg border bg-background px-4 py-3 pl-10 text-lg font-medium outline-none focus:border-foreground"
            autoComplete="off"
          />
          <span className="absolute left-3.5 top-3.5 text-lg text-muted-foreground">#</span>
          {searchNum && (
            <button
              type="button"
              onClick={() => setSearchNum("")}
              className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground"
            >
              \u2715
            </button>
          )}
        </div>

        {/* Quick result for number search */}
        {searchN != null && (
          <div className="mt-3 rounded-lg border-2 border-green-500 bg-green-50 p-4 dark:bg-green-950">
            {(() => {
              const allItems = [...numberedDishes, ...numberedDrinks, ...numberedWines];
              const found = allItems.find((i) => i.num === searchN);
              if (!found) return <p className="text-center text-sm text-muted-foreground">Aucun article n°{searchN}</p>;
              return (
                <div className="text-center">
                  <span className="text-3xl font-bold">#{found.num}</span>
                  <p className="mt-1 text-xl font-medium">{found.name}</p>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Section tabs */}
      <div className="mb-4 flex gap-1">
        {([
          { id: "plats" as const, label: "Plats", count: numberedDishes.length },
          { id: "boissons" as const, label: "Boissons", count: numberedDrinks.length },
          { id: "vins" as const, label: "Vins", count: numberedWines.length },
        ]).map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => { setSection(s.id); setSearchNum(""); }}
            className={`flex-1 rounded-lg py-2 text-center text-sm font-medium transition-colors ${
              section === s.id
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {s.label} ({s.count})
          </button>
        ))}
      </div>

      {/* Numbered list */}
      {section === "plats" && (
        <div className="space-y-4">
          {dishGroups.map(({ category: cat, items }) => {
            if (items.length === 0) return null;
            return (
              <section key={cat}>
                <h2 className="sticky top-28 z-10 mb-2 border-b bg-background py-2 text-sm font-semibold tracking-wide uppercase text-muted-foreground">
                  {CATEGORY_LABELS[cat]}
                </h2>
                <div className="space-y-1">
                  {items.map((item) => (
                    <div
                      key={item.num}
                      className={`flex items-center gap-3 rounded-lg border p-3 ${
                        searchN === item.num ? "border-green-500 bg-green-50 dark:bg-green-950" : ""
                      }`}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-bold text-background">
                        {item.num}
                      </span>
                      <span className="flex-1 text-sm font-medium">{item.name}</span>
                      <span className="shrink-0 text-sm text-muted-foreground">{item.price.toFixed(2)}€</span>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {section === "boissons" && (
        <div className="space-y-4">
          {drinkGroups.map(({ category, items: groupDrinks }) => {
            const items = numberedDrinks.filter((d) => d.category === category);
            if (items.length === 0) return null;
            return (
              <section key={category}>
                <h2 className="sticky top-28 z-10 mb-2 border-b bg-background py-2 text-sm font-semibold tracking-wide uppercase text-muted-foreground">
                  {DRINK_CAT_LABELS[category]}
                </h2>
                <div className="space-y-1">
                  {items.map((item) => (
                    <div
                      key={item.num}
                      className={`flex items-center gap-3 rounded-lg border p-3 ${
                        searchN === item.num ? "border-green-500 bg-green-50 dark:bg-green-950" : ""
                      }`}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-bold text-background">
                        {item.num}
                      </span>
                      <span className="flex-1 text-sm font-medium">{item.name}</span>
                      {item.price != null && (
                        <span className="shrink-0 text-sm text-muted-foreground">{item.price.toFixed(2)}€</span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {section === "vins" && (
        <div className="space-y-4">
          {wineGroups.map(({ color }) => {
            const items = numberedWines.filter((w) => w.color === color);
            if (items.length === 0) return null;
            return (
              <section key={color}>
                <h2 className="sticky top-28 z-10 mb-2 border-b bg-background py-2 text-sm font-semibold tracking-wide uppercase text-muted-foreground">
                  {WINE_COLOR_LABELS[color]}
                </h2>
                <div className="space-y-1">
                  {items.map((item) => (
                    <div
                      key={item.num}
                      className={`flex items-center gap-3 rounded-lg border p-3 ${
                        searchN === item.num ? "border-green-500 bg-green-50 dark:bg-green-950" : ""
                      }`}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-bold text-background">
                        {item.num}
                      </span>
                      <span className="flex-1 text-sm font-medium">{item.name}</span>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
