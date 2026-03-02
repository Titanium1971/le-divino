import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const { pin } = await request.json();

  if (!pin || typeof pin !== "string") {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    },
  );

  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "service_pin")
    .single();

  if (error || !data) {
    return NextResponse.json({ success: false }, { status: 500 });
  }

  const storedPin = typeof data.value === "string" ? data.value : String(data.value);
  const success = pin === storedPin;

  return NextResponse.json({ success });
}
