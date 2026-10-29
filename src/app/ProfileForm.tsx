"use client";

import { useState } from "react";
import { useAccount, useSignMessage } from "wagmi";

export default function ProfileForm({ onSuccess }: { onSuccess: () => void }) {
    const { address } = useAccount();
    const { signMessageAsync } = useSignMessage();

    const [username, setUsername] = useState('');
    const[isLoading, setIstLoading] = useState(false);

    const handleSaveProfile = async () => {
        if (!address) return alert("Konek ke wallet dulu blegug!!");
        if (!username) return alert("Username gak boleh kosong!");

        setIstLoading(true);

        try {
            const message = `Welcome To StakingKehed Blegug!\n\nKlik "sign" untuk memverifikasi kalo lu emang yang punya wallet dan kalo mau nyimpen username: ${username}`;
            const signature = await signMessageAsync({ message });

            const response = await fetch('/api/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                address,
                username,
                message,
                signature
            })
            });

            const data = await response.json();

            if (response.ok) {
                alert("Suksess! Lu berhasil terdaftar di StakingKehed!");
                setUsername('');
                onSuccess();
            } else {
                alert('Gagal: ${data.error}');
            }
        } catch (error) {
            console.log("Error signin:", error);
            alert("Proses di batalin atau terjadi error");
        } finally {
            setIstLoading(false);
        }
    };

    return (
        <div className="p-4 border border-gray-600 rounded-lg mt-4 bg-gray-800 text-white shadow-lg">
            <h2 className="text-xl font-bold mb-3">Buat / Update Profile</h2>
            <p className="text-xs tx-gray-400 mb-4">
             Lu butuh verifikasi (Sign Message) di Metamask buat nyimpen data ini!!.Tenang!! 100% aman!
            </p>
            <div className="flex flex-col gap-3">
                <input
                type="text"
                placeholder="Ketik username baru..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="p-2 rounded bg-gray-700 border border-gray-500 focus:outline-none focus:border-blue-500"/>
             <button
               onClick={handleSaveProfile}
               disabled={isLoading || !username}
               className="bg-blue-600 hover:bg-blue-700 p-2 rounded font-bold transition-all disabled:opacity-50">
                {isLoading? "Proses Sign & Loading.." : "Simpan Profile & Sign Wallet"}
               </button>
            </div>
        </div>
    );
}