import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type SeedDrink = {
  name: string;
  category: "soft" | "cocktail" | "biere" | "spiritueux" | "hot" | "autre";
  price: number;
  available: boolean;
  sort_order: number;
};

const DRINKS_SEED: SeedDrink[] = [
  // ══════════════════════════════════════
  // BOISSONS CHAUDES (hot)
  // ══════════════════════════════════════
  { name: "Expresso", category: "hot", price: 1.8, available: true, sort_order: 0 },
  { name: "Double Expresso", category: "hot", price: 3.6, available: true, sort_order: 1 },
  { name: "Ristretto", category: "hot", price: 1.8, available: true, sort_order: 2 },
  { name: "Lungo", category: "hot", price: 1.9, available: true, sort_order: 3 },
  { name: "Noisette", category: "hot", price: 2.1, available: true, sort_order: 4 },
  { name: "Décaffeinato", category: "hot", price: 2.1, available: true, sort_order: 5 },
  { name: "Macchiato", category: "hot", price: 2.1, available: true, sort_order: 6 },
  { name: "Café crème", category: "hot", price: 2.8, available: true, sort_order: 7 },
  { name: "Cappuccino", category: "hot", price: 3.5, available: true, sort_order: 8 },
  { name: "Latte macchiato", category: "hot", price: 2.8, available: true, sort_order: 9 },
  { name: "Café viennois", category: "hot", price: 3.9, available: true, sort_order: 10 },
  { name: "Café frappé", category: "hot", price: 3.9, available: true, sort_order: 11 },
  { name: "Café arrosé", category: "hot", price: 3.8, available: true, sort_order: 12 },
  { name: "Chocolat chaud", category: "hot", price: 3.5, available: true, sort_order: 13 },
  { name: "Chocolat viennois", category: "hot", price: 4.2, available: true, sort_order: 14 },
  { name: "Chocolat froid", category: "hot", price: 3.5, available: true, sort_order: 15 },
  { name: "Petit chocolat", category: "hot", price: 2.5, available: true, sort_order: 16 },
  { name: "Lait chaud", category: "hot", price: 2.5, available: true, sort_order: 17 },
  { name: "Thé vert", category: "hot", price: 3.2, available: true, sort_order: 18 },
  { name: "Thé noir", category: "hot", price: 3.2, available: true, sort_order: 19 },
  { name: "Thé menthe", category: "hot", price: 3.2, available: true, sort_order: 20 },
  { name: "Thé fruits rouges", category: "hot", price: 3.2, available: true, sort_order: 21 },
  { name: "Infusion tilleul", category: "hot", price: 3.2, available: true, sort_order: 22 },
  { name: "Infusion verveine", category: "hot", price: 3.2, available: true, sort_order: 23 },
  { name: "Irish Coffee", category: "hot", price: 9, available: true, sort_order: 24 },

  // ══════════════════════════════════════
  // SOFTS
  // ══════════════════════════════════════
  { name: "Coca-Cola", category: "soft", price: 3.6, available: true, sort_order: 30 },
  { name: "Coca-Cola Zéro", category: "soft", price: 3.6, available: true, sort_order: 31 },
  { name: "Fanta", category: "soft", price: 3.6, available: true, sort_order: 32 },
  { name: "Orangina", category: "soft", price: 3.6, available: true, sort_order: 33 },
  { name: "Sprite", category: "soft", price: 3.5, available: true, sort_order: 34 },
  { name: "Oasis", category: "soft", price: 3.6, available: true, sort_order: 35 },
  { name: "Ice Tea", category: "soft", price: 3.2, available: true, sort_order: 36 },
  { name: "Schweppes Tonic", category: "soft", price: 3.6, available: true, sort_order: 37 },
  { name: "Schweppes Agrumes", category: "soft", price: 3.6, available: true, sort_order: 38 },
  { name: "Red Bull", category: "soft", price: 4, available: true, sort_order: 39 },
  { name: "Limonade", category: "soft", price: 2.5, available: true, sort_order: 40 },
  { name: "Diabolo", category: "soft", price: 2.9, available: true, sort_order: 41 },
  { name: "Sirop", category: "soft", price: 2.1, available: true, sort_order: 42 },
  { name: "Monaco", category: "soft", price: 3, available: true, sort_order: 43 },
  { name: "Panaché", category: "soft", price: 2.7, available: true, sort_order: 44 },
  { name: "Jus de fruit", category: "soft", price: 3, available: true, sort_order: 45 },
  { name: "Jus d'orange", category: "soft", price: 3, available: true, sort_order: 46 },
  { name: "Perrier", category: "soft", price: 3.6, available: true, sort_order: 47 },
  { name: "San Pellegrino 50cl", category: "soft", price: 3.5, available: true, sort_order: 48 },
  { name: "San Pellegrino 1L", category: "soft", price: 6, available: true, sort_order: 49 },
  { name: "Evian 50cl", category: "soft", price: 3.5, available: true, sort_order: 50 },
  { name: "Evian 1L", category: "soft", price: 5, available: true, sort_order: 51 },
  { name: "Vittel 25cl", category: "soft", price: 2.8, available: true, sort_order: 52 },
  { name: "San Benedetto 50cl", category: "soft", price: 3.5, available: true, sort_order: 53 },
  { name: "San Benedetto 1L", category: "soft", price: 5, available: true, sort_order: 54 },
  { name: "Cristaline", category: "soft", price: 2, available: true, sort_order: 55 },
  { name: "Eau plastique 50cl", category: "soft", price: 1.5, available: true, sort_order: 56 },

  // ══════════════════════════════════════
  // BIÈRES
  // ══════════════════════════════════════
  { name: "Jupiler pression", category: "biere", price: 2.5, available: true, sort_order: 60 },
  { name: "Leffe", category: "biere", price: 3.5, available: true, sort_order: 61 },
  { name: "Leffe Ruby", category: "biere", price: 5, available: true, sort_order: 62 },
  { name: "Desperados", category: "biere", price: 5, available: true, sort_order: 63 },
  { name: "Hoegaarden blanche", category: "biere", price: 3.5, available: true, sort_order: 64 },
  { name: "Hoegaarden Rosé", category: "biere", price: 5, available: true, sort_order: 65 },
  { name: "Goose Island IPA", category: "biere", price: 5, available: true, sort_order: 66 },
  { name: "Pelforth brune", category: "biere", price: 5, available: true, sort_order: 67 },
  { name: "Mort Subite rouge", category: "biere", price: 5.5, available: true, sort_order: 68 },
  { name: "Saint Victor 33cl", category: "biere", price: 5.5, available: true, sort_order: 69 },
  { name: "Heineken 50cl", category: "biere", price: 5, available: true, sort_order: 70 },
  { name: "Heineken 65cl", category: "biere", price: 6.5, available: true, sort_order: 71 },
  { name: "1664 sans alcool", category: "biere", price: 3.5, available: true, sort_order: 72 },
  { name: "Affligen 50cl", category: "biere", price: 5, available: true, sort_order: 73 },
  { name: "Fada", category: "biere", price: 6, available: true, sort_order: 74 },
  { name: "Fada blanche", category: "biere", price: 4.2, available: true, sort_order: 75 },
  { name: "Fada abricot", category: "biere", price: 6.5, available: true, sort_order: 76 },
  { name: "Alaryk 75cl", category: "biere", price: 15, available: true, sort_order: 77 },
  { name: "Heineken 0.0", category: "biere", price: 3.5, available: true, sort_order: 78 },
  { name: "Girafe", category: "biere", price: 30, available: true, sort_order: 79 },

  // ══════════════════════════════════════
  // COCKTAILS
  // ══════════════════════════════════════
  { name: "Spritz", category: "cocktail", price: 9.5, available: true, sort_order: 80 },
  { name: "Mojito royal", category: "cocktail", price: 10, available: true, sort_order: 81 },
  { name: "Sangria verre", category: "cocktail", price: 7.5, available: true, sort_order: 82 },
  { name: "Sangria demi-litre", category: "cocktail", price: 12, available: true, sort_order: 83 },
  { name: "Sangria litre", category: "cocktail", price: 22, available: true, sort_order: 84 },
  { name: "Punch maison", category: "cocktail", price: 6.5, available: true, sort_order: 85 },
  { name: "Punch litre", category: "cocktail", price: 21.5, available: true, sort_order: 86 },
  { name: "Champagne royal", category: "cocktail", price: 9, available: true, sort_order: 87 },
  { name: "Blanc kir", category: "cocktail", price: 4.5, available: true, sort_order: 88 },
  { name: "Vodka Red Bull", category: "cocktail", price: 8, available: true, sort_order: 89 },
  { name: "Gin Fizz", category: "cocktail", price: 6.5, available: true, sort_order: 90 },
  { name: "Shooter", category: "cocktail", price: 3.5, available: true, sort_order: 91 },
  { name: "Shooter mètre", category: "cocktail", price: 25, available: true, sort_order: 92 },
  { name: "Cocktail avec alcool", category: "cocktail", price: 9.5, available: true, sort_order: 93 },
  { name: "Cocktail sans alcool", category: "cocktail", price: 7.5, available: true, sort_order: 94 },
  { name: "Orgasm", category: "cocktail", price: 7.5, available: true, sort_order: 95 },
  { name: "Baby cocktail", category: "cocktail", price: 4, available: true, sort_order: 96 },

  // ══════════════════════════════════════
  // SPIRITUEUX
  // ══════════════════════════════════════
  { name: "Pastis 51", category: "spiritueux", price: 2.5, available: true, sort_order: 100 },
  { name: "Ricard", category: "spiritueux", price: 2.5, available: true, sort_order: 101 },
  { name: "Casanis", category: "spiritueux", price: 2.5, available: true, sort_order: 102 },
  { name: "Picon", category: "spiritueux", price: 4.8, available: true, sort_order: 103 },
  { name: "Suze", category: "spiritueux", price: 4.5, available: true, sort_order: 104 },
  { name: "Campari", category: "spiritueux", price: 4.5, available: true, sort_order: 105 },
  { name: "Martini", category: "spiritueux", price: 4.5, available: true, sort_order: 106 },
  { name: "Porto", category: "spiritueux", price: 4.5, available: true, sort_order: 107 },
  { name: "Muscat de Frontignan", category: "spiritueux", price: 4.5, available: true, sort_order: 108 },
  { name: "Apérol", category: "spiritueux", price: 6, available: true, sort_order: 109 },
  { name: "Vodka", category: "spiritueux", price: 6, available: true, sort_order: 110 },
  { name: "Rhum", category: "spiritueux", price: 6, available: true, sort_order: 111 },
  { name: "Gin", category: "spiritueux", price: 6, available: true, sort_order: 112 },
  { name: "Whisky", category: "spiritueux", price: 6, available: true, sort_order: 113 },
  { name: "Malibu", category: "spiritueux", price: 6, available: true, sort_order: 114 },
  { name: "Baileys", category: "spiritueux", price: 6, available: true, sort_order: 115 },
  { name: "Get", category: "spiritueux", price: 6, available: true, sort_order: 116 },
  { name: "Limoncello maison", category: "spiritueux", price: 6, available: true, sort_order: 117 },
  { name: "Liqueur de pêche", category: "spiritueux", price: 2, available: true, sort_order: 118 },
  { name: "Cognac", category: "spiritueux", price: 7, available: true, sort_order: 119 },
  { name: "Monkey Shoulder whisky", category: "spiritueux", price: 7, available: true, sort_order: 120 },
  { name: "Jack Daniel's", category: "spiritueux", price: 9, available: true, sort_order: 121 },
  { name: "Poire Williams", category: "spiritueux", price: 9, available: true, sort_order: 122 },
  { name: "Armagnac", category: "spiritueux", price: 9, available: true, sort_order: 123 },

  // ══════════════════════════════════════
  // AUTRES
  // ══════════════════════════════════════
  { name: "Verre d'eau", category: "autre", price: 0, available: true, sort_order: 130 },
  { name: "Supplément sirop", category: "autre", price: 0.2, available: true, sort_order: 131 },
  { name: "Pot de lait", category: "autre", price: 0.5, available: true, sort_order: 132 },
  { name: "Bouteille de champagne", category: "autre", price: 60, available: true, sort_order: 133 },
  { name: "Viennoiserie", category: "autre", price: 2, available: true, sort_order: 134 },
  { name: "Formule déjeuner", category: "autre", price: 8, available: true, sort_order: 135 },
];

export async function POST() {
  try {
    const supabase = await createClient();

    // Verify auth
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Check existing drinks to avoid duplicates
    const { data: existing } = await supabase.from("drinks").select("name");
    const existingNames = new Set((existing ?? []).map((d) => d.name.toLowerCase()));

    const toInsert = DRINKS_SEED.filter(
      (d) => !existingNames.has(d.name.toLowerCase())
    );

    if (toInsert.length === 0) {
      return NextResponse.json({
        message: "Toutes les boissons existent déjà",
        inserted: 0,
        skipped: DRINKS_SEED.length,
      });
    }

    // Insert in batches of 50
    let insertedCount = 0;
    for (let i = 0; i < toInsert.length; i += 50) {
      const batch = toInsert.slice(i, i + 50);
      const { error } = await supabase.from("drinks").insert(batch);
      if (error) {
        return NextResponse.json(
          {
            error: `Erreur batch ${i}: ${error.message}`,
            insertedSoFar: insertedCount,
          },
          { status: 500 }
        );
      }
      insertedCount += batch.length;
    }

    return NextResponse.json({
      message: `${insertedCount} boissons insérées avec succès`,
      inserted: insertedCount,
      skipped: DRINKS_SEED.length - insertedCount,
      categories: {
        hot: DRINKS_SEED.filter((d) => d.category === "hot").length,
        soft: DRINKS_SEED.filter((d) => d.category === "soft").length,
        biere: DRINKS_SEED.filter((d) => d.category === "biere").length,
        cocktail: DRINKS_SEED.filter((d) => d.category === "cocktail").length,
        spiritueux: DRINKS_SEED.filter((d) => d.category === "spiritueux").length,
        autre: DRINKS_SEED.filter((d) => d.category === "autre").length,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Erreur serveur: ${err}` },
      { status: 500 }
    );
  }
}
