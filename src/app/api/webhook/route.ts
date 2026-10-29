import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const STAKING_CONTRACT_ADDRESS = "0xB17eF2e17Cc4968c79f39366EaAdD40a9CCb3107".toLowerCase();

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("CCTV Alchemy ngirim data:", JSON.stringify(body, null, 2));
        const activities = body.event?.activity || [];
        console.log(`Total logs yang masuk dari alchemy: ${activities.length}`);

        let targetWallet = null;
        let actionType = null;

        for (const act of activities) {
            const toAddress = act.toAddress?.toLowerCase();
            const fromAddress = act.fromAddress?.toLowerCase();

            if(act.category === "token") {

            if (toAddress === STAKING_CONTRACT_ADDRESS) {

                console.log("Kehed Sedang otw staking!!");
                targetWallet = act.fromAddress;
                actionType = "STAKE";
                break;
            } else if (fromAddress === STAKING_CONTRACT_ADDRESS ) {
                console.log("Kehed nya mau di Unstake??!!");
                targetWallet = toAddress;
                actionType = "UNSTAKE";
                break;  
            }
        }
    }

        if ( targetWallet && actionType ) {
            console.log(`Berhasil mendeteksi user Wallet: ${targetWallet} dengan aksi: ${actionType}`);

            const { data: existingUser } = await supabase
            .from('profiles')
            .select('points')
            .eq('wallet_address', targetWallet)
            .single();

        const currentPoints = existingUser?.points || 0;

        const newPoints = actionType == "STAKE" ? currentPoints + 10 : currentPoints - 10;

        const finalPoint = newPoints < 0 ? 0 : newPoints;

        const { error: updateError } = await supabase
        .from('profiles')
        .update({ points: finalPoint})
        .eq('wallet_address', targetWallet);

        if (updateError) {
        console.error("Gagal update Supabase:", updateError.message);
        } else {
            console.log("Point Berhasil bertambah sekarang jadi ${finalPoint} ke Supabase Untuk Wallet:", targetWallet);
        }
      } else {
        console.log("Tidak ada event matching contract StakingKehed di Block ini...");
    }
        return NextResponse.json({ message: 'Data di terima Bos Kehed!!' }, { status: 200 });
    } catch (error) {
        console.log("Error di terima webhook:", error);
        return NextResponse.json({ error: 'Server lagi ngadat!!' }, { status: 500 });
    }
}