import { parseAbi } from "viem";

export const STAKING_CONTRACT_ADDRESS = "0xB17eF2e17Cc4968c79f39366EaAdD40a9CCb3107";
export const TOKEN_CONTRACT_ADDRESS = "0x573D20F7196EE5a69C4E18B0bAc7F6329951F0Da";

export const tokenAbi = parseAbi([
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function balanceOf(address account) external view returns (uint256)",
    ]);

export const stakingAbi = parseAbi([
    "function stake(uint256 amount) external",
    "function withdraw() external",
    "function claimReward() external",
    "function stakedBalances(address account) external view returns (uint256)",
    "function rewards(address account) external view returns (uint256)",
]);
