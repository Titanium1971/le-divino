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

  const { name, eventType } = await request.json();
  if (!name) {
    return NextResponse.json({ error: "Le nom est requis" }, { status: 400 });
  }

  const typeLabels: Record<string, string> = {
    concert: "soirée concert / musique live",
    dj: "soirée DJ / musique électronique",
    theme: "soirée à thème",
    degustation: "soirée dégustation / wine tasting",
    brunch: "brunch événementiel",
    prive: "événement privé",
    autre: "événement spécial",
  };
  const typeLabel = typeLabels[eventType] || "événement restaurant";

  try {
    // ── 1. Generate text content with GPT-4o-mini ──
    const textResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.8,
      messages: [
        {
          role: "system",
          content: `Tu es le community manager du restaurant méditerranéen premium « Le Divino » à Agde (Hérault).
Tu rédiges des descriptions d'événements courtes, engageantes et festives pour le site web et les réseaux sociaux.
Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks.`,
        },
        {
          role: "user",
          content: `Génère le contenu pour cet événement :
- Titre saisi : "${name}"
- Type : ${typeLabel}

Réponds avec ce format JSON exact :
{
  "name": "Titre accrocheur et bien formaté pour l'affichage (majuscules, accents corrects)",
  "description_fr": "Description de 2-3 lignes, engageante et festive. Donne envie de participer. Mentionne l'ambiance, le cadre méditerranéen, l'expérience."
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

    // ── 2. Generate poster image with DALL-E 3 ──
    const imagePrompts: Record<string, string> = {
      concert: `Event poster design for "${generated.name}" at a premium Mediterranean restaurant, live music concert, warm golden and burgundy tones, elegant typography feel, candlelit terrace, guitar silhouette, festive atmosphere, dark sophisticated background`,
      dj: `Event poster design for "${generated.name}" at a luxury restaurant lounge, DJ night, neon lights reflecting on wine glasses, dark elegant ambiance, purple and gold tones, modern Mediterranean nightlife`,
      theme: `Event poster design for "${generated.name}" at a premium Mediterranean restaurant, themed dinner party, elegant table setting, warm decorative lighting, festive atmosphere, burgundy and gold color palette`,
      degustation: `Event poster design for "${generated.name}" at a premium restaurant, wine tasting event, elegant wine bottles and crystal glasses, Mediterranean setting, warm candlelight, sophisticated amber tones`,
      brunch: `Event poster design for "${generated.name}" at a Mediterranean restaurant, elegant brunch, sunny terrace, fresh pastries and champagne, soft natural morning light, warm inviting atmosphere`,
      prive: `Event poster design for "${generated.name}" at a luxury Mediterranean restaurant, private event, elegant dimly lit dining room, crystal chandeliers, gold and burgundy tones, exclusive atmosphere`,
      autre: `Event poster design for "${generated.name}" at a premium Mediterranean restaurant, special event, elegant festive atmosphere, warm golden lighting, dark sophisticated background`,
    };

    const imagePrompt = imagePrompts[eventType] || imagePrompts.autre;

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
    console.error("Generate event content error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Erreur de génération",
      },
      { status: 500 },
    );
  }
}
