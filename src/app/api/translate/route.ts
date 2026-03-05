import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    console.error("Translation error: OPENAI_API_KEY is not set in .env.local");
    return NextResponse.json(
      { error: "OPENAI_API_KEY manquante. Ajoutez-la dans .env.local." },
      { status: 500 },
    );
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const { name, description } = await request.json();

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const prompt = `Tu es un traducteur professionnel pour un restaurant français haut de gamme.
Traduis le nom et la description de ce plat du français vers l'anglais, l'italien, l'espagnol et l'allemand.
Garde le ton gastronomique et élégant. Ne traduis pas les noms propres ou les appellations spécifiques.

Nom du plat (FR) : ${name}
Description (FR) : ${description || ""}

Réponds UNIQUEMENT avec un objet JSON valide, sans markdown ni backticks :
{
  "name": { "en": "…", "it": "…", "es": "…", "de": "…" },
  "description": { "en": "…", "it": "…", "es": "…", "de": "…" }
}`;

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });

    const text = completion.choices[0]?.message?.content ?? "";
    const parsed = JSON.parse(text);

    return NextResponse.json(parsed);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Translation error:", msg);
    return NextResponse.json(
      { error: `Erreur traduction : ${msg}` },
      { status: 500 },
    );
  }
}
