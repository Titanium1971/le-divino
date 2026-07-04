import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function POST(request: NextRequest) {
  // Kill-switch: admin/AI generation disabled (unpaid invoice). Re-enable with ADMIN_ENABLED="true".
  if (process.env.ADMIN_ENABLED !== "true") {
    return NextResponse.json({ error: "Service temporairement désactivé" }, { status: 503 });
  }
  const openai = getOpenAI();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { name, type } = await request.json();
  if (!name) {
    return NextResponse.json({ error: "Le nom est requis" }, { status: 400 });
  }

  const typeLabels: Record<string, string> = {
    entree_plat: "menu entrée + plat",
    plat_dessert: "menu plat + dessert",
    complet: "menu complet (entrée + plat + dessert)",
    enfant: "menu enfant",
    brunch: "brunch",
    degustation: "menu dégustation",
  };
  const typeLabel = typeLabels[type] || "menu restaurant";

  try {
    const textResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.8,
      messages: [
        {
          role: "system",
          content: `Tu es le rédacteur de la carte d'un restaurant méditerranéen premium « Le Divino » à Agde (Hérault).
Tu rédiges des descriptions courtes, élégantes et appétissantes pour les formules/menus.
Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks.`,
        },
        {
          role: "user",
          content: `Génère le contenu pour ce menu :
- Nom saisi : "${name}"
- Type : ${typeLabel}

Réponds avec ce format JSON exact :
{
  "name": "Nom accrocheur et bien formaté pour la carte (majuscules, accents corrects)",
  "description_fr": "Description de 1-2 lignes, style carte de restaurant premium. Évoque l'esprit du menu, les saveurs méditerranéennes. Concis et élégant."
}`,
        },
      ],
    });

    const textContent = textResponse.choices[0]?.message?.content?.trim();
    if (!textContent) {
      return NextResponse.json(
        { error: "Pas de contenu généré" },
        { status: 500 },
      );
    }

    let generated: { name: string; description_fr: string };
    try {
      generated = JSON.parse(textContent);
    } catch {
      return NextResponse.json(
        { error: "Réponse IA invalide", raw: textContent },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      name: generated.name,
      description_fr: generated.description_fr,
    });
  } catch (err) {
    console.error("Generate menu content error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Erreur de génération",
      },
      { status: 500 },
    );
  }
}
