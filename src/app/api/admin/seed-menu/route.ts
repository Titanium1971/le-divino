import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type SeedDish = {
  name_fr: string;
  description_fr?: string;
  price: number | null;
  category_slug: string;
  menu_type: "carte" | "marche" | "express";
  sort_order: number;
};

const CATEGORIES_SEED = [
  { name: "Entrées", slug: "entrees", sort_order: 0 },
  { name: "Plats", slug: "plats", sort_order: 1 },
  { name: "Desserts", slug: "desserts", sort_order: 2 },
  { name: "Formules", slug: "formules", sort_order: 3 },
];

const DISHES_SEED: SeedDish[] = [
  // CARTE — Entrées
  { name_fr: "Aumônière de chèvre confiture de figues et oignons", price: 11, category_slug: "entrees", menu_type: "carte", sort_order: 0 },
  { name_fr: "Œuf mollet sur salade et chips de lard", price: 9, category_slug: "entrees", menu_type: "carte", sort_order: 1 },
  { name_fr: "Gravlak de saumon maison", price: 13, category_slug: "entrees", menu_type: "carte", sort_order: 2 },
  { name_fr: "Tartare de thon sauce asiatique", price: 14, category_slug: "entrees", menu_type: "carte", sort_order: 3 },

  // CARTE — Plats
  { name_fr: "Saumon à l'unilatéral, crème citron et persillade", price: 21, category_slug: "plats", menu_type: "carte", sort_order: 10 },
  { name_fr: "Magret entier réduction framboise balsamique", price: 26, category_slug: "plats", menu_type: "carte", sort_order: 11 },
  { name_fr: "Suprême de volaille saveur d'Asie", price: 19, category_slug: "plats", menu_type: "carte", sort_order: 12 },
  { name_fr: "Filet mignon à la crème", price: 19, category_slug: "plats", menu_type: "carte", sort_order: 13 },
  { name_fr: "Pièce de bœuf en sauce", price: 26, category_slug: "plats", menu_type: "carte", sort_order: 14 },
  { name_fr: "Thon sauce citron", price: 21, category_slug: "plats", menu_type: "carte", sort_order: 15 },
  { name_fr: "Entrecôte ou filet de bœuf en sauce", price: 25, category_slug: "plats", menu_type: "carte", sort_order: 16 },

  // CARTE — Desserts
  { name_fr: "Crème brûlée vanille", price: 7, category_slug: "desserts", menu_type: "carte", sort_order: 20 },
  { name_fr: "Moelleux chocolat cœur chocolat ou framboise", price: 8, category_slug: "desserts", menu_type: "carte", sort_order: 21 },
  { name_fr: "Tarte tatin", price: 8, category_slug: "desserts", menu_type: "carte", sort_order: 22 },

  // MENU DU MARCHÉ — Entrées
  { name_fr: "Gravlak de saumon émulsion chutney mangue", price: null, category_slug: "entrees", menu_type: "marche", sort_order: 30 },
  { name_fr: "Œuf mollet chips de lard", price: null, category_slug: "entrees", menu_type: "marche", sort_order: 31 },
  { name_fr: "Aumônière de chèvre au pruneau", price: null, category_slug: "entrees", menu_type: "marche", sort_order: 32 },
  { name_fr: "Tartare de thon crème de citron", price: null, category_slug: "entrees", menu_type: "marche", sort_order: 33 },
  { name_fr: "Tartare de saumon crème de mangue", price: null, category_slug: "entrees", menu_type: "marche", sort_order: 34 },
  { name_fr: "Accras de morue sauce curcuma citron", price: null, category_slug: "entrees", menu_type: "marche", sort_order: 35 },

  // MENU DU MARCHÉ — Plats
  { name_fr: "Saumon à l'unilatéral sauce citron curcuma", price: null, category_slug: "plats", menu_type: "marche", sort_order: 40 },
  { name_fr: "Demi-magret réduction balsamique framboises", price: null, category_slug: "plats", menu_type: "marche", sort_order: 41 },
  { name_fr: "Poulet sauce asiatique", price: null, category_slug: "plats", menu_type: "marche", sort_order: 42 },
  { name_fr: "Thon à la crème de citron", price: null, category_slug: "plats", menu_type: "marche", sort_order: 43 },
  { name_fr: "Pièce de bœuf en sauce", price: null, category_slug: "plats", menu_type: "marche", sort_order: 44 },

  // FORMULE EXPRESS
  {
    name_fr: "Formule Express",
    description_fr: "Salade fermière (poulet, œufs) ou Salade océane (saumon gravlak) + dessert au choix",
    price: 15.90,
    category_slug: "formules",
    menu_type: "express",
    sort_order: 50,
  },
];

export async function POST() {
  const supabase = await createClient();

  // Check auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Upsert categories
    const categoryMap: Record<string, string> = {};

    for (const cat of CATEGORIES_SEED) {
      // Check if exists
      const { data: existing } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", cat.slug)
        .single();

      if (existing) {
        categoryMap[cat.slug] = existing.id;
      } else {
        const { data: created, error } = await supabase
          .from("categories")
          .insert({ name: cat.name, slug: cat.slug, sort_order: cat.sort_order, visible: true })
          .select("id")
          .single();
        if (error) throw error;
        categoryMap[cat.slug] = created!.id;
      }
    }

    // 2. Insert dishes (skip if name_fr already exists for same menu_type)
    const inserted: string[] = [];
    const skipped: string[] = [];

    for (const dish of DISHES_SEED) {
      // Check if dish already exists
      const { data: existing } = await supabase
        .from("dishes")
        .select("id")
        .eq("menu_type", dish.menu_type)
        .filter("name->>fr", "eq", dish.name_fr)
        .maybeSingle();

      if (existing) {
        skipped.push(dish.name_fr);
        continue;
      }

      const { error } = await supabase.from("dishes").insert({
        category_id: categoryMap[dish.category_slug],
        menu_type: dish.menu_type,
        name: { fr: dish.name_fr, en: "", it: "", es: "", de: "" },
        description: {
          fr: dish.description_fr ?? "",
          en: "",
          it: "",
          es: "",
          de: "",
        },
        price: dish.price ?? 0,
        sort_order: dish.sort_order,
        available: true,
        allergens: [],
        is_vegetarian: false,
        is_signature: false,
      });

      if (error) throw error;
      inserted.push(dish.name_fr);
    }

    return NextResponse.json({
      success: true,
      categories: Object.keys(categoryMap).length,
      inserted: inserted.length,
      skipped: skipped.length,
      details: { inserted, skipped },
    });
  } catch (err) {
    console.error("Seed menu error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
