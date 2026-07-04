import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function POST(request: NextRequest) {
  // Kill-switch: admin/AI generation disabled (unpaid invoice). Re-enable with ADMIN_ENABLED="true".
  if (process.env.ADMIN_ENABLED !== "true") {
    return NextResponse.json({ error: "Service temporairement désactivé" }, { status: 503 });
  }
  const openai = getOpenAI();
  const supabase = await createClient();

  // Check auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { dishId } = await request.json();
  if (!dishId) {
    return NextResponse.json({ error: "dishId required" }, { status: 400 });
  }

  // Get dish from DB
  const { data: dish, error: fetchError } = await supabase
    .from("dishes")
    .select("id, name_fr, description_fr, image_path")
    .eq("id", dishId)
    .single();

  if (fetchError || !dish) {
    return NextResponse.json({ error: "Dish not found" }, { status: 404 });
  }

  const dishName = dish.name_fr || "French dish";
  const dishDesc = dish.description_fr || "";
  const subject = dishDesc ? `${dishName} - ${dishDesc}` : dishName;

  try {
    // Generate image with DALL-E 3
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Professional food photography, restaurant quality, ${subject}, french cuisine, elegant plating on a dark slate plate, soft natural lighting, shallow depth of field, Michelin-style presentation`,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    const imageUrl = response.data?.[0]?.url;
    if (!imageUrl) {
      return NextResponse.json({ error: "No image generated" }, { status: 500 });
    }

    // Download the image
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();

    // Delete old image if exists
    if (dish.image_path) {
      await supabase.storage.from("dishes").remove([dish.image_path]);
    }

    // Upload to Supabase Storage
    const storagePath = `${dish.id}.png`;
    const { error: uploadError } = await supabase.storage
      .from("dishes")
      .upload(storagePath, imageBuffer, {
        upsert: true,
        contentType: "image/png",
      });

    if (uploadError) throw uploadError;

    // Update dish record
    const { error: updateError } = await supabase
      .from("dishes")
      .update({ image_path: storagePath })
      .eq("id", dish.id);

    if (updateError) throw updateError;

    // Get public URL
    const { data: urlData } = supabase.storage.from("dishes").getPublicUrl(storagePath);

    return NextResponse.json({
      success: true,
      dishId: dish.id,
      imagePath: storagePath,
      publicUrl: urlData.publicUrl,
    });
  } catch (err) {
    console.error("DALL-E generation error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Image generation failed" },
      { status: 500 },
    );
  }
}
