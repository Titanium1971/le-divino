import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
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
    soft: "boisson sans alcool / soft drink",
    cocktail: "cocktail",
    biere: "bière",
    spiritueux: "spiritueux / apéritif",
    hot: "boisson chaude (café, thé, chocolat)",
    autre: "boisson",
  };
  const categoryLabel = categoryLabels[category] || "boisson";

  try {
    // ── 1. Generate text content with GPT-4o-mini ──
    const textResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.8,
      messages: [
        {
          role: "system",
          content: `Tu es le rédacteur de la carte d'un restaurant méditerranéen premium « Le Divino » à Agde (Hérault).
Tu rédiges des descriptions courtes, élégantes et appétissantes pour la carte des boissons.
Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks.`,
        },
        {
          role: "user",
          content: `Génère le contenu pour cette boisson :
- Nom saisi : "${name}"
- Type : ${categoryLabel}

Réponds avec ce format JSON exact :
{
  "name": "Nom accrocheur et bien formaté pour la carte (majuscules, accents corrects)",
  "description_fr": "Description de 2-3 lignes, style carte de restaurant premium. Mentionne les saveurs, les arômes ou l'origine. Sois poétique mais concis."
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
    const imagePrompts: Record<string, string> = {
      soft: `Professional beverage photography of ${generated.name}, refreshing non-alcoholic drink, condensation on glass, ice cubes, elegant bar setting, dark moody background, soft warm lighting, shallow depth of field, premium restaurant quality`,
      cocktail: `Professional cocktail photography of ${generated.name}, beautifully garnished cocktail in an elegant glass, bar counter, dark moody ambiance, dramatic lighting, bokeh background, Michelin-star bar presentation`,
      biere: `Professional beer photography of ${generated.name}, golden beer in a proper glass with foam head, dark wooden bar background, warm lighting, condensation on glass, premium pub atmosphere`,
      spiritueux: `Professional spirits photography of ${generated.name}, premium liquor in an elegant glass, dark sophisticated background, dramatic side lighting, amber tones, luxury bar setting`,
      hot: `Professional coffee/tea photography of ${generated.name}, steaming hot beverage in an elegant cup on a dark saucer, café ambiance, warm natural lighting, latte art if coffee, cozy premium atmosphere`,
      autre: `Professional beverage photography of ${generated.name}, elegant presentation, premium restaurant setting, soft natural lighting, dark background`,
    };

    const imagePrompt =
      imagePrompts[category] || imagePrompts.autre;

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
    console.error("Generate drink content error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Erreur de génération",
      },
      { status: 500 },
    );
  }
}
