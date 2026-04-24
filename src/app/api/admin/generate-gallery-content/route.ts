import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function POST(request: NextRequest) {
  const openai = getOpenAI();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { hint, tag } = await request.json();

  const tagLabels: Record<string, string> = {
    restaurant: "l'intérieur ou l'extérieur d'un restaurant méditerranéen premium",
    dishes: "un plat gastronomique méditerranéen",
    events: "un événement festif dans un restaurant",
    team: "l'équipe d'un restaurant",
    ambiance: "l'ambiance et l'atmosphère d'un restaurant",
  };
  const tagLabel = tagLabels[tag] || "une photo de restaurant";

  try {
    const textResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.8,
      messages: [
        {
          role: "system",
          content: `Tu es le community manager du restaurant méditerranéen premium « Le Divino » à Agde (Hérault).
Tu rédiges des légendes courtes et élégantes pour les photos de la galerie du site web.
Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks.`,
        },
        {
          role: "user",
          content: `Génère une légende pour une photo de galerie :
- Indice / contexte : "${hint || "photo du restaurant"}"
- Catégorie : ${tagLabel}

Réponds avec ce format JSON exact :
{
  "caption_fr": "Légende courte et élégante en français (1-2 phrases max). Poétique, évocatrice, donne envie de découvrir le lieu."
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

    let generated: { caption_fr: string };
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
      caption_fr: generated.caption_fr,
    });
  } catch (err) {
    console.error("Generate gallery content error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Erreur de génération",
      },
      { status: 500 },
    );
  }
}
