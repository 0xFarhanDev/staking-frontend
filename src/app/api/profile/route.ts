import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyMessage } from "viem";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseService = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseService);


export async function GET(request: Request) {

    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
        return NextResponse.json({error: "Wallet address wajib di isi!!" }, { status: 400 });
    }

    const normalizerAddress = address.toLowerCase();

    const { data: userProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('wallet_address', normalizerAddress)
        .single();

    if(error || !userProfile) {
        return NextResponse.json({ massage: "User belum di buat!!, SSilahkan buat username dulu bro!!"}, { status: 404 });
    }

    return NextResponse.json(userProfile, { status: 200 });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { address, username, signature, message } = body;

        if (!address || !username || !signature || !message) {
            return NextResponse.json({ error: "Data tidak lengkap bro!"}, { status: 400 });
        }

        const isValid = await verifyMessage({
            address: address as `0x${string}`,
            message: message,
            signature: signature as `0x${string}`,
        });

        if(!isValid) {
            return NextResponse.json({ error: "Tanda tangan palsu/tidak valid!"}, { status: 401});
        }

        const normalizerAddress = address.toLowerCase();

        const { error } = await supabase
        .from('profiles')
        .upsert({
            wallet_address: normalizerAddress,
            username: username
        }, {onConflict: 'wallet_address'})
        .select()
        .single();

        if(error) throw error;

        return NextResponse.json ({ message: "Profil berhasil di amankan!"}, {status: 200});
    } catch (error) {
        console.error("Error saving profile", error);
        return NextResponse.json({error: "Server lagi ngadat"}, { status: 500});
    }
};