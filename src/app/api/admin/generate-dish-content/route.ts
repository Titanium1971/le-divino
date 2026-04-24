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

  const { name, category } = await request.json();
  if (!name) {
    return NextResponse.json({ error: "Le nom est requis" }, { status: 400 });
  }

  const categoryLabels: Record<string, string> = {
    entree: "entrée de restaurant gastronomique",
    plat: "plat principal de restaurant gastronomique",
    dessert: "dessert de restaurant gastronomique",
    accompagnement: "accompagnement / garniture",
    fromage: "plateau de fromages",
    tapas: "tapas / amuse-bouche",
    enfant: "plat enfant",
  };
  const categoryLabel = categoryLabels[category] || "plat de restaurant";

  try {
    // ── 1. Generate text content with GPT-4o-mini ──
    const textResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.8,
      messages: [
        {
          role: "system",
          content: `Tu es le rédacteur de la carte d'un restaurant méditerranéen premium « Le Divino » à Agde (Hérault).
Tu rédiges des descriptions courtes, élégantes et appétissantes pour la carte.
Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks.`,
        },
        {
          role: "user",
          content: `Génère le contenu pour ce plat :
- Nom saisi : "${name}"
- Type : ${categoryLabel}

Réponds avec ce format JSON exact :
{
  "name": "Nom accrocheur et bien formaté pour la carte (majuscules, accents corrects)",
  "description_fr": "Description de 2-3 lignes, style carte de restaurant premium. Mentionne les saveurs, les ingrédients ou la technique de cuisson. Sois poétique mais concis."
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

    // ── 2. Generate image with DALL-E 3 ──
    const imagePrompt = `Professional food photography of ${generated.name}, ${categoryLabel}, french mediterranean cuisine, elegant plating on a dark slate plate, soft natural lighting, shallow depth of field, Michelin-style presentation, dark moody restaurant background, warm tones`;

    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: imagePrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    const dalleUrl = imageResponse.data?.[0]?.url;
    let imageBase64: string | null = null;

    if (dalleUrl) {
      const imgRes = await fetch(dalleUrl);
      const buffer = await imgRes.arrayBuffer();
      imageBase64 = Buffer.from(buffer).toString("base64");
    }

    return NextResponse.json({
      success: true,
      name: generated.name,
      description_fr: generated.description_fr,
      imageBase64,
    });
  } catch (err) {
    console.error("Generate dish content error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Erreur de génération",
      },
      { status: 500 },
    );
  }
}
