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

  const { name, color } = await request.json();
  if (!name) {
    return NextResponse.json({ error: "Le nom est requis" }, { status: 400 });
  }

  const colorLabels: Record<string, string> = {
    rouge: "vin rouge",
    blanc: "vin blanc",
    rose: "vin rosé",
    champagne: "champagne / mousseux",
  };
  const colorLabel = colorLabels[color] || "vin";

  try {
    // ── 1. Generate text content with GPT-4o-mini ──
    const textResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.8,
      messages: [
        {
          role: "system",
          content: `Tu es le sommelier du restaurant méditerranéen premium « Le Divino » à Agde (Hérault).
Tu rédiges des descriptions courtes, élégantes et poétiques pour la carte des vins.
Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks.`,
        },
        {
          role: "user",
          content: `Génère le contenu pour ce vin :
- Nom saisi : "${name}"
- Type : ${colorLabel}

Réponds avec ce format JSON exact :
{
  "name": "Nom complet bien formaté (domaine, cuvée, appellation)",
  "description_fr": "Description de 2-3 lignes pour la carte des vins. Notes de dégustation, arômes, accords mets-vins. Style sommelier, élégant et concis."
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
      rouge: `Professional wine photography of a bottle of ${generated.name}, red wine, dark elegant background, warm candlelight ambiance, wine glass with deep ruby color beside the bottle, premium restaurant cellar setting, shallow depth of field`,
      blanc: `Professional wine photography of a bottle of ${generated.name}, white wine, chilled elegant presentation, condensation on bottle, light golden wine in crystal glass, dark restaurant background, soft lighting`,
      rose: `Professional wine photography of a bottle of ${generated.name}, rosé wine, beautiful pale pink color in crystal glass, Mediterranean terrace feel, soft natural lighting, elegant summer setting`,
      champagne: `Professional champagne photography of ${generated.name}, sparkling wine, elegant flute glass with fine bubbles, ice bucket, dark luxurious background, celebration atmosphere, golden lighting`,
    };

    const imagePrompt = imagePrompts[color] || imagePrompts.rouge;

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
    console.error("Generate wine content error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Erreur de génération",
      },
      { status: 500 },
    );
  }
}
