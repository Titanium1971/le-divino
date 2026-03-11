import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const maxDuration = 300; // 5 minutes for Vercel

export async function POST() {
  const supabase = await createClient();

  // Check auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get all dishes without images
  const { data: dishes, error } = await supabase
    .from("dishes")
    .select("id, name_fr, description_fr, image_path")
    .is("image_path", null)
    .order("sort_order");

  if (error) throw error;

  if (!dishes || dishes.length === 0) {
    return NextResponse.json({ success: true, message: "All dishes already have images", generated: 0 });
  }

  const results: { id: string; name: string; status: string }[] = [];

  for (const dish of dishes) {
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
        results.push({ id: dish.id, name: dishName, status: "no_url" });
        continue;
      }

      // Download the image
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();

      // Upload to Supabase Storage
      const storagePath = `${dish.id}.png`;
      const { error: uploadError } = await supabase.storage
        .from("dishes")
        .upload(storagePath, imageBuffer, {
          upsert: true,
          contentType: "image/png",
        });

      if (uploadError) {
        results.push({ id: dish.id, name: dishName, status: `upload_error: ${uploadError.message}` });
        continue;
      }

      // Update dish record
      await supabase
        .from("dishes")
        .update({ image_path: storagePath })
        .eq("id", dish.id);

      results.push({ id: dish.id, name: dishName, status: "ok" });

      // Rate limit: wait 2 seconds between generations
      if (dishes.indexOf(dish) < dishes.length - 1) {
        await sleep(2000);
      }
    } catch (err) {
      results.push({
        id: dish.id,
        name: dishName,
        status: `error: ${err instanceof Error ? err.message : "unknown"}`,
      });
      // Wait longer on error (rate limit)
      await sleep(5000);
    }
  }

  const generated = results.filter((r) => r.status === "ok").length;

  return NextResponse.json({
    success: true,
    total: dishes.length,
    generated,
    results,
  });
}
