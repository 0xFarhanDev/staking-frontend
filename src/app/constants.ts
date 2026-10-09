import { parseAbi } from "viem";

export const STAKING_CONTRACT_ADDRESS = "0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0";
export const TOKEN_CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

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
