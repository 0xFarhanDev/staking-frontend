"use client";

import * as React from "react";
import { RainbowKitProvider, getDefaultWallets } from "@rainbow-me/rainbowkit";
import { http, WagmiProvider, createConfig } from "wagmi";
import { foundry, sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@rainbow-me/rainbowkit/styles.css";

const { connectors } = getDefaultWallets({
    appName: "Staking Kehed",
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
});

const config = createConfig({
    connectors,
    chains: [foundry, sepolia],
    transports: {
    [foundry.id]: http("http://127.0.0.1:8545"),
    [sepolia.id]: http(),
},
    ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider>{children}</RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
