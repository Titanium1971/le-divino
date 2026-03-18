import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generatePosterImage } from "@/lib/gemini";
import { getTemplate } from "@/lib/poster-templates";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { templateId, orientation, prompt, mode } = await request.json();

  if (!templateId || !prompt) {
    return NextResponse.json(
      { error: "Template et prompt requis" },
      { status: 400 },
    );
  }

  const template = getTemplate(templateId);
  if (!template) {
    return NextResponse.json(
      { error: "Template inconnu" },
      { status: 400 },
    );
  }

  const aspectRatio = orientation === "landscape" ? "16:9" : "9:16";

  try {
    let finalPrompt = prompt;
    if (mode === "full") {
      // Full mode: remove any "no text" instructions and let AI render text
      finalPrompt = finalPrompt
        .replace(/Do NOT include any text.*?typography[^.]*\./gi, "")
        .replace(/Leave.*?negative space.*?\./gi, "")
        .trim();
      finalPrompt += "\n\nInclude all text elements with elegant, legible typography. The text should be perfectly readable and beautifully integrated into the poster design.";
    } else {
      // Background-only: text is composited client-side via Canvas
      finalPrompt += "\n\nCRITICAL: Do NOT render any text, letters, words, numbers, or typography on the image. The image must be purely visual with no written content.";
    }

    const imageBase64 = await generatePosterImage(finalPrompt, aspectRatio as "9:16" | "16:9");

    return NextResponse.json({
      success: true,
      backgroundBase64: imageBase64,
      mode: mode || "canvas",
    });
  } catch (err) {
    console.error("Generate poster error:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Erreur de génération",
      },
      { status: 500 },
    );
  }
}
