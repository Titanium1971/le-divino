import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type SeedDish = {
  name_fr: string;
  description_fr?: string;
  price: number;
  category: "entree" | "plat" | "dessert";
  source: "carte" | "marche";
  sort_order: number;
};

const DISHES_SEED: SeedDish[] = [
  // CARTE — Entrées
  { name_fr: "Aumônière de chèvre confiture de figues et oignons", description_fr: "Croustillant doré au chèvre fondant, nappé d'une confiture de figues maison et oignons caramélisés", price: 11, category: "entree", source: "carte", sort_order: 0 },
  { name_fr: "Œuf mollet sur salade et chips de lard", description_fr: "Œuf mollet coulant déposé sur un lit de mesclun frais, copeaux de lard croustillant", price: 9, category: "entree", source: "carte", sort_order: 1 },
  { name_fr: "Gravlak de saumon maison", description_fr: "Saumon mariné aux herbes et épices scandinaves, tranché finement et servi avec une émulsion d'aneth", price: 13, category: "entree", source: "carte", sort_order: 2 },
  { name_fr: "Tartare de thon sauce asiatique", description_fr: "Thon rouge coupé au couteau, relevé d'une sauce soja sésame gingembre et zeste de citron vert", price: 14, category: "entree", source: "carte", sort_order: 3 },

  // CARTE — Plats
  { name_fr: "Saumon à l'unilatéral, crème citron et persillade", description_fr: "Pavé de saumon cuit côté peau, nappé d'une crème légère au citron et d'une persillade fraîche", price: 21, category: "plat", source: "carte", sort_order: 10 },
  { name_fr: "Magret entier réduction framboise balsamique", description_fr: "Magret de canard rôti entier, accompagné d'une réduction framboise et vinaigre balsamique", price: 26, category: "plat", source: "carte", sort_order: 11 },
  { name_fr: "Suprême de volaille saveur d'Asie", description_fr: "Suprême de poulet fermier laqué aux saveurs d'Asie, wok de légumes croquants", price: 19, category: "plat", source: "carte", sort_order: 12 },
  { name_fr: "Filet mignon à la crème", description_fr: "Filet mignon de porc rôti, sauce crème aux champignons des bois", price: 19, category: "plat", source: "carte", sort_order: 13 },
  { name_fr: "Pièce de bœuf en sauce", description_fr: "Pièce de bœuf sélectionnée, sauce au choix du chef, garniture de saison", price: 26, category: "plat", source: "carte", sort_order: 14 },
  { name_fr: "Thon sauce citron", description_fr: "Pavé de thon mi-cuit, sauce vierge au citron et huile d'olive", price: 21, category: "plat", source: "carte", sort_order: 15 },
  { name_fr: "Entrecôte ou filet de bœuf en sauce", description_fr: "Entrecôte ou filet de bœuf grillé, sauce au poivre ou béarnaise, frites maison", price: 25, category: "plat", source: "carte", sort_order: 16 },

  // CARTE — Desserts
  { name_fr: "Crème brûlée vanille", description_fr: "Crème onctueuse à la vanille de Madagascar, caramélisée à la flamme", price: 7, category: "dessert", source: "carte", sort_order: 20 },
  { name_fr: "Moelleux chocolat cœur chocolat ou framboise", description_fr: "Moelleux au chocolat noir intense, cœur fondant chocolat ou coulis de framboise", price: 8, category: "dessert", source: "carte", sort_order: 21 },
  { name_fr: "Tarte tatin", description_fr: "Tarte tatin aux pommes caramélisées, servie tiède avec une quenelle de crème fraîche", price: 8, category: "dessert", source: "carte", sort_order: 22 },

  // MENU DU MARCHÉ — Entrées
  { name_fr: "Gravlak de saumon émulsion chutney mangue", description_fr: "Saumon gravlax délicat, accompagné d'une émulsion au chutney de mangue épicé", price: 0, category: "entree", source: "marche", sort_order: 30 },
  { name_fr: "Œuf mollet chips de lard", description_fr: "Œuf parfaitement mollet sur salade de saison, chips de lard fumé croustillant", price: 0, category: "entree", source: "marche", sort_order: 31 },
  { name_fr: "Aumônière de chèvre au pruneau", description_fr: "Aumônière croustillante au chèvre fondant et pruneau d'Agen confit", price: 0, category: "entree", source: "marche", sort_order: 32 },
  { name_fr: "Tartare de thon crème de citron", description_fr: "Tartare de thon frais au couteau, crème légère de citron et ciboulette", price: 0, category: "entree", source: "marche", sort_order: 33 },
  { name_fr: "Tartare de saumon crème de mangue", description_fr: "Tartare de saumon frais, crème onctueuse à la mangue et touche de citron vert", price: 0, category: "entree", source: "marche", sort_order: 34 },
  { name_fr: "Accras de morue sauce curcuma citron", description_fr: "Beignets croustillants de morue aux herbes, sauce relevée au curcuma et citron", price: 0, category: "entree", source: "marche", sort_order: 35 },

  // MENU DU MARCHÉ — Plats
  { name_fr: "Saumon à l'unilatéral sauce citron curcuma", description_fr: "Saumon cuit à l'unilatéral, sauce crémeuse citron curcuma et légumes de saison", price: 0, category: "plat", source: "marche", sort_order: 40 },
  { name_fr: "Demi-magret réduction balsamique framboises", description_fr: "Demi-magret de canard rosé, réduction de vinaigre balsamique aux framboises", price: 0, category: "plat", source: "marche", sort_order: 41 },
  { name_fr: "Poulet sauce asiatique", description_fr: "Suprême de poulet fermier laqué, sauce soja miel gingembre et légumes sautés", price: 0, category: "plat", source: "marche", sort_order: 42 },
  { name_fr: "Thon à la crème de citron", description_fr: "Pavé de thon snacké, nappé d'une crème de citron frais et herbes du jardin", price: 0, category: "plat", source: "marche", sort_order: 43 },
  { name_fr: "Pièce de bœuf en sauce", description_fr: "Pièce de bœuf sélectionnée, sauce du jour et garniture de saison", price: 0, category: "plat", source: "marche", sort_order: 44 },
];

type SeedMenu = {
  name_fr: string;
  description_fr: string;
  price: number;
  type: "entree_plat" | "plat_dessert" | "entree_plat_dessert";
};

const MENUS_SEED: SeedMenu[] = [
  { name_fr: "Formule Entrée + Plat", description_fr: "Une entrée et un plat au choix parmi la sélection du marché", price: 22, type: "entree_plat" },
  { name_fr: "Formule Plat + Dessert", description_fr: "Un plat et un dessert au choix parmi la sélection du marché", price: 22, type: "plat_dessert" },
  { name_fr: "Formule Complète", description_fr: "Entrée, plat et dessert au choix parmi la sélection du marché", price: 27, type: "entree_plat_dessert" },
];

export async function POST() {
  const supabase = await createClient();

  // Check auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Insert dishes (skip duplicates by name_fr + source)
    const inserted: string[] = [];
    const skipped: string[] = [];

    for (const dish of DISHES_SEED) {
      const { data: existing } = await supabase
        .from("dishes")
        .select("id")
        .eq("name_fr", dish.name_fr)
        .eq("source", dish.source)
        .maybeSingle();

      if (existing) {
        skipped.push(dish.name_fr);
        continue;
      }

      const { error } = await supabase.from("dishes").insert({
        name_fr: dish.name_fr,
        description_fr: dish.description_fr ?? null,
        price: dish.price,
        category: dish.category,
        source: dish.source,
        sort_order: dish.sort_order,
        available: true,
      });

      if (error) throw error;
      inserted.push(dish.name_fr);
    }

    // 2. Insert menus (skip duplicates by type)
    const menusInserted: string[] = [];

    for (const menu of MENUS_SEED) {
      const { data: existing } = await supabase
        .from("menus")
        .select("id")
        .eq("type", menu.type)
        .maybeSingle();

      if (existing) continue;

      const { error } = await supabase.from("menus").insert(menu);
      if (error) throw error;
      menusInserted.push(menu.name_fr);
    }

    return NextResponse.json({
      success: true,
      dishes: { inserted: inserted.length, skipped: skipped.length },
      menus: { inserted: menusInserted.length },
      details: { inserted, skipped, menusInserted },
    });
  } catch (err) {
    console.error("Seed menu error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
