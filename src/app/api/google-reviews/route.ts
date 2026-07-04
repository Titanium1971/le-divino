import { NextRequest, NextResponse } from "next/server";
import reviewsSnapshot from "@/data/google-reviews-snapshot.json";

export const revalidate = 3600; // cache for 1 hour

const SUPPORTED_LANGS = new Set(["fr", "en", "it", "es", "de"]);

export async function GET(request: NextRequest) {
  // Kill-switch: when live reviews are disabled (unpaid invoice / cost freeze),
  // never call the paid Places API — serve a static snapshot of the last-known
  // reviews. Re-enable by setting REVIEWS_LIVE_ENABLED="true" on Vercel.
  if (process.env.REVIEWS_LIVE_ENABLED !== "true") {
    return NextResponse.json(reviewsSnapshot);
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const placeId = process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    return NextResponse.json({ error: "Google API not configured" }, { status: 500 });
  }

  const langParam = request.nextUrl.searchParams.get("lang") ?? "fr";
  const lang = SUPPORTED_LANGS.has(langParam) ? langParam : "fr";

  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}?languageCode=${lang}`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "rating,userRatingCount,reviews",
        },
        next: { revalidate: 3600 },
      },
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Google Places API error:", res.status, errorText);
      return NextResponse.json({ error: "Google API error" }, { status: 502 });
    }

    const data = await res.json();

    // Shape the response — only return what we need
    const reviews = (data.reviews ?? []).slice(0, 5).map(
      (r: {
        authorAttribution?: { displayName?: string; photoUri?: string };
        rating?: number;
        text?: { text?: string };
        relativePublishTimeDescription?: string;
      }) => ({
        author: r.authorAttribution?.displayName ?? "",
        photoUrl: r.authorAttribution?.photoUri ?? "",
        rating: r.rating ?? 5,
        text: r.text?.text ?? "",
        relativeTime: r.relativePublishTimeDescription ?? "",
      }),
    );

    return NextResponse.json({
      rating: data.rating ?? null,
      totalReviews: data.userRatingCount ?? 0,
      reviews,
    });
  } catch (err) {
    console.error("Google Reviews fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}
