import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(request: NextRequest) {
  const { name, description } = await request.json();

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const prompt = `Tu es un traducteur professionnel pour un restaurant français haut de gamme.
Traduis le nom et la description de ce plat du français vers l'anglais, l'italien et l'espagnol.
Garde le ton gastronomique et élégant. Ne traduis pas les noms propres ou les appellations spécifiques.

Nom du plat (FR) : ${name}
Description (FR) : ${description || ""}

Réponds UNIQUEMENT avec un objet JSON valide, sans markdown ni backticks :
{
  "name": { "en": "…", "it": "…", "es": "…" },
  "description": { "en": "…", "it": "…", "es": "…" }
}`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    const parsed = JSON.parse(text);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Translation error:", err);
    return NextResponse.json(
      { error: "Translation failed" },
      { status: 500 },
    );
  }
}
