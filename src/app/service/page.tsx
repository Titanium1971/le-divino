"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Category, Dish } from "@/lib/types/database";
import { Button } from "@/components/ui/button";

type DishGroup = { category: Category; dishes: Dish[] };

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

  return <KitchenDashboard onLock={() => { setAuthenticated(false); setPin(""); }} />;
}

// ── Kitchen Dashboard ──

function KitchenDashboard({ onLock }: { onLock: () => void }) {
  const supabase = createClient();
  const [groups, setGroups] = useState<DishGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDishes = useCallback(async () => {
    const [catRes, dishRes] = await Promise.all([
      supabase.from("categories").select("*").eq("visible", true).order("sort_order"),
      supabase.from("dishes").select("*").order("sort_order"),
    ]);

    if (catRes.error || dishRes.error) return;

    const categories = (catRes.data ?? []) as Category[];
    const dishes = (dishRes.data ?? []) as Dish[];

    setGroups(
      categories.map((category) => ({
        category,
        dishes: dishes.filter((d) => d.category_id === category.id),
      })),
    );
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchDishes();
  }, [fetchDishes]);

  // Supabase Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("dishes-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "dishes" },
        () => {
          fetchDishes();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchDishes]);

  async function handleToggle(dish: Dish) {
    await supabase
      .from("dishes")
      .update({ available: !dish.available })
      .eq("id", dish.id);
    // Realtime will trigger refresh, but also update locally for instant feedback
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
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-light tracking-wide">Cuisine — Disponibilités</h1>
        <Button variant="outline" size="sm" onClick={onLock}>
          Verrouiller
        </Button>
      </div>

      {/* Dish toggles grouped by category */}
      {groups.map(({ category, dishes }) => (
        <section key={category.id} className="mb-6">
          <h2 className="sticky top-0 z-10 mb-2 bg-background py-2 text-base font-medium tracking-wide border-b">
            {category.name}
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
                <span className="text-sm font-medium">{dish.name.fr}</span>
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
