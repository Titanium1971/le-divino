import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generatePosterImage, assemblePrompt } from "@/lib/gemini";
import { getTemplate } from "@/lib/poster-templates";

function formatDateFR(dateStr: string): string {
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { templateId, orientation, variables, prompt, eventId } = await request.json();

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
    // Build text overlay instructions from variables
    const textElements: string[] = [];
    const vars = variables || {};

    if (vars.eventName || vars.title) {
      textElements.push(`the title "${vars.eventName || vars.title}" prominently at the top`);
    }
    if (vars.subtitle) {
      textElements.push(`the subtitle "${vars.subtitle}"`);
    }
    if (vars.artistName) {
      textElements.push(`the artist name "${vars.artistName}"`);
    }
    if (vars.djName) {
      textElements.push(`the DJ name "${vars.djName}"`);
    }
    if (vars.teams) {
      textElements.push(`the match "${vars.teams}"`);
    }
    if (vars.date) {
      textElements.push(`the date "${formatDateFR(vars.date)}"`);
    }
    if (vars.time) {
      textElements.push(`the time "${vars.time}"`);
    }
    if (vars.kickoff) {
      textElements.push(`kick-off at "${vars.kickoff}"`);
    }
    if (vars.timeRange) {
      textElements.push(`the schedule "${vars.timeRange}"`);
    }
    if (vars.price) {
      textElements.push(`the price "${vars.price}" in bold`);
    }
    if (vars.tagline) {
      textElements.push(`the tagline "${vars.tagline}"`);
    }
    if (vars.promoText) {
      textElements.push(`the offer "${vars.promoText}"`);
    }
    if (vars.specialOffer) {
      textElements.push(`the special offer "${vars.specialOffer}"`);
    }
    if (vars.dressCode) {
      textElements.push(`the dress code "${vars.dressCode}"`);
    }
    if (vars.hostName) {
      textElements.push(`"Hosted by ${vars.hostName}"`);
    }
    if (vars.wineRegion) {
      textElements.push(`the wine region "${vars.wineRegion}"`);
    }
    if (vars.menuHighlight) {
      textElements.push(`menu highlights: "${vars.menuHighlight}"`);
    }
    if (vars.description) {
      textElements.push(`the description "${vars.description}"`);
    }
    if (vars.ctaText) {
      textElements.push(`the call to action "${vars.ctaText}" in bold`);
    }
    if (vars.validDates) {
      textElements.push(`the validity "${vars.validDates}"`);
    }
    if (vars.theme) {
      textElements.push(`the theme "${vars.theme}"`);
    }

    let enrichedPrompt = prompt;
    if (textElements.length > 0) {
      enrichedPrompt += `\n\nIMPORTANT: The poster MUST include ALL the following text rendered clearly and legibly on the image with elegant typography and strong contrast: ${textElements.join(", ")}. Also display "Le Divino" at the bottom of the poster.`;
    }

    const imageBase64 = await generatePosterImage(enrichedPrompt, aspectRatio as "9:16" | "16:9");

    // Upload to Supabase storage
    const byteArray = Uint8Array.from(atob(imageBase64), (c) => c.charCodeAt(0));
    const blob = new Blob([byteArray], { type: "image/png" });

    const posterId = crypto.randomUUID();
    const path = `${posterId}.png`;

    const { error: uploadError } = await supabase.storage
      .from("posters")
      .upload(path, blob, { upsert: true, contentType: "image/png" });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      // Still return the image even if upload fails
      return NextResponse.json({
        success: true,
        imageBase64,
        posterId: null,
        imagePath: null,
      });
    }

    // Save to poster_generations table
    const dimensions = orientation === "landscape"
      ? { image_width: 1920, image_height: 1080 }
      : { image_width: 1080, image_height: 1920 };

    const { data: poster, error: dbError } = await supabase
      .from("poster_generations")
      .insert({
        id: posterId,
        event_id: eventId || null,
        template_id: templateId,
        orientation: orientation || "portrait",
        variables: variables || {},
        ai_prompt: prompt,
        image_path: path,
        ...dimensions,
      })
      .select()
      .single();

    if (dbError) {
      console.error("DB error:", dbError);
    }

    return NextResponse.json({
      success: true,
      imageBase64,
      posterId: poster?.id || posterId,
      imagePath: path,
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
