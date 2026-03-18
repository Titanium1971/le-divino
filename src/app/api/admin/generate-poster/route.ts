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

  const { templateId, orientation, prompt, mode, variables } = await request.json();

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

      // Inject variable values as text content for the AI to render
      if (variables && typeof variables === "object") {
        const textEntries = Object.entries(variables as Record<string, string>)
          .filter(([, v]) => v && v.trim())
          .map(([k, v]) => `- ${k}: "${v}"`)
          .join("\n");
        if (textEntries) {
          finalPrompt += `\n\nIMPORTANT: Include the following text elements on the poster with elegant, perfectly legible typography. Each text must be rendered exactly as written, with no spelling errors or missing characters:\n${textEntries}`;
        }
      }

      finalPrompt += "\n\nThe text must be perfectly readable, beautifully integrated into the design, and use a luxurious, elegant font style. Add \"Le Divino\" as branding at the bottom.";
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
