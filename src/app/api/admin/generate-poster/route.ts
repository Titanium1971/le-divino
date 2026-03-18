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
      // Full mode: strip ALL "no text" related sentences from the prompt
      finalPrompt = finalPrompt
        .replace(/Do NOT include any text[^.]*\./gi, "")
        .replace(/The image must be purely visual[^.]*\./gi, "")
        .replace(/Leave[^.]*negative space[^.]*\./gi, "")
        .replace(/Keep[^.]*open[^.]*overlay[^.]*\./gi, "")
        .replace(/Keep[^.]*center[^.]*open[^.]*\./gi, "")
        .replace(/\s{2,}/g, " ")
        .trim();

      // Build text block from variables
      const textLines: string[] = [];
      if (variables && typeof variables === "object") {
        const vars = variables as Record<string, string>;
        if (vars.eventName || vars.title) textLines.push(`Title: "${vars.eventName || vars.title}"`);
        if (vars.subtitle || vars.theme) textLines.push(`Subtitle: "${vars.subtitle || vars.theme}"`);
        if (vars.artistName || vars.djName) textLines.push(`Artist: "${vars.artistName || vars.djName}"`);
        if (vars.date) textLines.push(`Date: "${vars.date}"`);
        if (vars.time || vars.timeRange) textLines.push(`Time: "${vars.time || vars.timeRange}"`);
        if (vars.price) textLines.push(`Price: "${vars.price}"`);
        if (vars.description) textLines.push(`Description: "${vars.description}"`);
        // Catch any remaining filled variables
        for (const [k, v] of Object.entries(vars)) {
          if (v && v.trim() && !["eventName", "title", "subtitle", "theme", "artistName", "djName", "date", "time", "timeRange", "price", "description"].includes(k)) {
            textLines.push(`${k}: "${v}"`);
          }
        }
      }

      finalPrompt += `\n\nThis is a COMPLETE poster — you MUST render the following text on the image with beautiful, perfectly legible typography:\n`;
      if (textLines.length > 0) {
        finalPrompt += textLines.join("\n") + "\n";
      }
      finalPrompt += `- Branding: "Le Divino" at the bottom\n`;
      finalPrompt += `\nRender each text EXACTLY as written — no spelling errors, no missing characters, no deformed letters. Use elegant, high-contrast fonts that are easy to read against the background.`;
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
