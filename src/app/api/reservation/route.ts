import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { name, email, phone, date, time, guests } = body;

  if (!name || !email || !phone || !date || !time || !guests) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // TODO: Save reservation to Supabase
  // const supabase = await createClient();
  // await supabase.from("reservations").insert({ ... });

  return NextResponse.json({ success: true });
}
