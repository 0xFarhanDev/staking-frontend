import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() { 
try {
    const { data, error } = await supabase
    .from('profiles')
    .select('username, wallet_address, points, level')
    .order('points', { ascending: false })
    .limit(10);

    if (error) throw error;

    return NextResponse.json(data, { status: 200 });
} catch (error) {
    console.error("Gagal fetch lederboard, error");
    return NextResponse.json({ error: 'Gagal ngambil data leaderboard!! '}, { status: 500 })
}
}