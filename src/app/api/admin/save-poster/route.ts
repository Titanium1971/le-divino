import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { compositeBase64, templateId, orientation, variables, prompt, eventId, fontId } =
    await request.json();

  if (!compositeBase64 || !templateId) {
    return NextResponse.json(
      { error: "Image composite et template requis" },
      { status: 400 },
    );
  }

  try {
    // Upload composite image to Supabase storage
    const byteArray = Uint8Array.from(atob(compositeBase64), (c) => c.charCodeAt(0));
    const blob = new Blob([byteArray], { type: "image/png" });

    const posterId = crypto.randomUUID();
    const path = `${posterId}.png`;

    const { error: uploadError } = await supabase.storage
      .from("posters")
      .upload(path, blob, { upsert: true, contentType: "image/png" });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: "Erreur d'upload: " + uploadError.message },
        { status: 500 },
      );
    }

    // Save to poster_generations table
    const dimensions =
      orientation === "landscape"
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
        ai_prompt: prompt || "",
        image_path: path,
        font_id: fontId || null,
        ...dimensions,
      })
      .select()
      .single();

    if (dbError) {
      console.error("DB error:", dbError);
    }

    return NextResponse.json({
      success: true,
      posterId: poster?.id || posterId,
      imagePath: path,
    });
  } catch (err) {
    console.error("Save poster error:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Erreur de sauvegarde",
      },
      { status: 500 },
    );
  }
}
