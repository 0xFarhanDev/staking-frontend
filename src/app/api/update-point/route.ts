import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseService = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseService);

export async function POST(request: Request) {
    try {
        const { walletAddress, pointToAdd } = await request.json(); 

        if (!walletAddress || !pointToAdd) {
            return NextResponse.json({ error: "Wallet address atau poin kosong!" }, { status: 400 });
        }

        const normalizerAddress = walletAddress.toLowerCase();

        const { data: user, error: fetchError } = await supabase
            .from('profiles')
            .select('points')
            .eq('wallet_address', normalizerAddress)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            throw fetchError;
        }

        const currentPoint = user?.points || 0;

        const { error: updateError } = await supabase
            .from('profiles')
            .update({ points: currentPoint + pointToAdd })
            .eq('wallet_address', normalizerAddress);
        
        if (updateError) throw updateError;

        return NextResponse.json({ message: 'Point Update!!' }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Gagal update Poin kehed!' }, { status: 500 });
    }
}