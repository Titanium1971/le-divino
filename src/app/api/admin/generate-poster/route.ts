import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generatePosterImage, assemblePrompt } from "@/lib/gemini";
import { getTemplate } from "@/lib/poster-templates";

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
    // Generate image with Gemini Imagen 3
    const imageBase64 = await generatePosterImage(prompt, aspectRatio as "9:16" | "16:9");

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
