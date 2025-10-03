import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase/supabaseClient";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const modeId = searchParams.get("modeId");

    if (!modeId) {
      return NextResponse.json(
        { error: "modeId is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.rpc("blind_rank_leaderboard", {
      mode_uuid: modeId,
    });

    if (error) {
      console.error("RPC error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ leaderboard: data });
  } catch (err: unknown) {
    console.error("Unexpected error:", err);

    // unknown tipini kontrol etmek gerekiyor
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
