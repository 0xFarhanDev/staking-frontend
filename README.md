# StakingKehed frontend prototype

A Next.js App Router prototype for a Sepolia ERC-20 staking interface. It connects an EVM wallet, reads token and staking contract state, submits staking transactions, stores a wallet-linked profile in Supabase after a signature, and displays a points leaderboard.

> **Status:** portfolio prototype. It has not been audited or hardened for production. The webhook verifies Alchemy's HMAC signature, but event processing still lacks replay protection and idempotency. Points are not a trustworthy on-chain accounting system. Do not use this prototype to handle valuable assets or production user data.

## Stack

- Next.js 16, React 19, and TypeScript
- Wagmi, RainbowKit, Viem, and Ethers.js
- Supabase for off-chain profile and leaderboard data
- Sepolia contracts: KHD token `0x573D20F7196EE5a69C4E18B0bAc7F6329951F0Da`, staking proxy `0xB17eF2e17Cc4968c79f39366EaAdD40a9CCb3107`

## Run locally

Requirements: Node.js 20+ and npm.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Connect a wallet configured for Sepolia and use test tokens only.

## Environment

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID used by RainbowKit. |
| `NEXT_PUBLIC_RPC_URL` | Sepolia JSON-RPC endpoint used by Wagmi. |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only Supabase service key for API routes. Never prefix this with `NEXT_PUBLIC_` or expose it to the browser. |
| `ALCHEMY_WEBHOOK_SIGNING_KEY` | Signing key from the Alchemy webhook settings, used to verify webhook requests. |

Create a Supabase `profiles` table with `wallet_address` (text, unique), `username` (text), `points` (integer, default 0), and `level` (integer, default 1). The service key bypasses Row Level Security; keep it server-side and restrict access to the deployment environment.

## Useful commands

```sh
npm run dev       # local development
npm run lint      # ESLint
npm run build     # production build
npm start         # serve a production build
```

## Routes and components

```text
src/app/page.tsx                 wallet dashboard and staking actions
src/app/ProfileForm.tsx          signed wallet profile form
src/app/Leaderboard.tsx          Supabase leaderboard
src/app/api/profile/route.ts     profile read and signature-verified upsert
src/app/api/leaderboard/route.ts leaderboard read
src/app/api/webhook/route.ts     staking activity webhook prototype
```

## Security and current scope

- The public `update-point` route was removed because it allowed unauthenticated point updates for arbitrary wallet addresses.
- The webhook verifies `X-Alchemy-Signature` against the raw request body with HMAC-SHA256. Replay protection and idempotent event processing still need implementation before relying on points.
- Contract addresses and the Sepolia chain are currently configured in source. Reconcile them with a fresh deployment before using the UI.
- Wallet and transaction error handling, contract event indexing, and end-to-end coverage are incomplete. This repository is a prototype, not a production staking interface.
- The previous source included an Alchemy RPC key. It has been removed from the current code; rotate or revoke that key in Alchemy because deleting it from the latest version does not remove it from Git history.

## License

No project license is currently specified.
