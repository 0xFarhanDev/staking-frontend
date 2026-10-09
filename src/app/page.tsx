"use client";

import { useState, useEffect } from "react";
import { BrowserProvider, Contract } from "ethers";
import { formatEther, parseEther, createWalletClient, createPublicClient, custom } from "viem";
import { foundry } from "viem/chains";
import { STAKING_CONTRACT_ADDRESS, TOKEN_CONTRACT_ADDRESS, tokenAbi, stakingAbi } from "./constants";
import { useReadContract, useWriteContract } from "wagmi";

export default function Home() {
  const [address, setAddress] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      (window as any).ethereum
        .request({ method: "eth_accounts" })
        .then((accounts: string[]) => {
          if (accounts.length > 0) setAddress(accounts[0]);
        });
    }
  }, []);

  // Fungsi connect langsung tembus ke MetaMask
  const connectWallet = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        });
        setAddress(accounts[0]);
        console.log("Connected to:", accounts[0]);
      } catch (error) {
        console.error("User rejected connection:", error);
      }
    } else {
      alert("MetaMask tidak terdeteksi! Pastikan ekstensi terpasang.");
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
  };

  const isConnected = Boolean(address);

  const { data: tokenBalance, refetch: refetchTokenBalance } = useReadContract({
    address: TOKEN_CONTRACT_ADDRESS as `0x${string}`,
    abi: tokenAbi,
    functionName: "balanceOf",
    args: address ? [address as `0x${string}`] : undefined,
  });

  const { data: stakedBalance, refetch: refetchStakedBalance } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS as `0x${string}`,
    abi: stakingAbi,
    functionName: "stakedBalances",
    args: address ? [address as `0x${string}`] : undefined,
  });

  const { data: pendingRewards, refetch: refetchPendingRewards } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS as `0x${string}`,
    abi: stakingAbi,
    functionName: "rewards",
    args: address ? [address as `0x${string}`] : undefined,
  });

  const getWalletClient = () => {
    return createWalletClient({
      account: address as `0x${string}`,
      chain: foundry,
      transport: custom((window as any).ethereum),
    }) as any;
  };

  const getPublicClient = () => {
    return createPublicClient({
      chain: foundry,
      transport: custom((window as any).ethereum),
    }) as any;
  };

  const getContract = async (contractAddress: string, abi: any) => {
    if (!window || (!window as any).ethereum) throw new Error("No Ethereum Providers");
    const provider = new BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    return new Contract(contractAddress, abi, signer);
  };

  const { writeContract } = useWriteContract();

  const handleApprove = async () => {
    if (!amount || Number(amount) <= 0) return alert("Please enter an amount to approve.");
     if(!address) return alert("Please connect your wallet first.");
     try {
      setIsLoading(true);
      const client = getWalletClient();
      const hash = await client.writeContract({
      address: TOKEN_CONTRACT_ADDRESS as `0x${string}`,
      abi: tokenAbi,
      functionName: "approve",
      args: [STAKING_CONTRACT_ADDRESS as `0x${string}`, parseEther(amount)],
      account: address as `0x${string}`,
    });
    console.log("Approve TX Hash:", hash);
    alert("Approve Berhasil di prosses di wallet! Lanjut klik stake.");
  } catch (error) {
    console.log(error);
    alert("Transaksi di batalkan atau error!!.");
  } finally {
    setIsLoading(false);
   }
  };

  const handleStake = async () => {
    if (!amount || Number(amount) <= 0) return alert("Please enter an amount to stake.");
    if (!address) return alert("Connect wallet first");

    try {
      setIsLoading(true);
      const client = getWalletClient();
      const hash = await client.writeContract({
        address: STAKING_CONTRACT_ADDRESS as `0x${string}`,
        abi: stakingAbi,
        functionName: "stake",
        args: [parseEther(amount)],
        account: address as `0x${string}`,
      });

      const publicClient = getPublicClient();
      await publicClient.waitForTransactionReceipt({ hash });

      console.log("Stake TX Hash:", hash);
      alert("Stake Berhasil bro!!.");
      refetchTokenBalance();
      refetchStakedBalance();
      refetchPendingRewards();
    } catch (error) {
      console.log(error);
      alert("Stake gagal bro di mulai dari awal lagi!!");
    } finally {
      setIsLoading(false);
    }
  };
   
  const handleWithdraw = async () => {
    if(!address) return alert("Connect wallet hela sakali");
     
    try {
      setIsLoading(true);
     const stakingContract = await getContract(STAKING_CONTRACT_ADDRESS, stakingAbi);
     const tx = await stakingContract.withdraw();
     console.log("Withdraw TX Hash:", tx.hash);

      await tx.wait();
      refetchTokenBalance();
      refetchStakedBalance();
    alert("Withdraw Berhasil!!.");
  } catch (error) {
    console.log(error);
    alert("Gagal withdraw bro!!,Ulang lagi coba.");
  } finally {
    setIsLoading(false);
  }
  };

  const handleClaimRewards = async () => {
    if (!address) return alert("Connect Wallet Hela Atuh euuyy..");

    try {
      setIsLoading(true);
      const client = getWalletClient();
      const hash = await client.writeContract({
      address: STAKING_CONTRACT_ADDRESS as `0x${string}`,
      abi: stakingAbi,
      functionName: "claimReward",
      account: address as `0x${string}`,
    });
    console.log("Claim TX Hash:", hash);
    alert("Rewards udah dapet nih.");
    refetchTokenBalance();
    refetchStakedBalance();
    refetchPendingRewards();
  } catch (error) {
    console.log(error);
    alert("Gagal Claim bro,Ulang lagi!!.");
  } finally {
    setIsLoading(false);
  }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-gray-950 text-white">
      {/* Header / Navbar */}
      <div className="w-full max-w-5xl flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-wider text-yellow-400">
          STAKING KEHED 🚀
        </h1>
        {isConnected ? (
          <button
            onClick={disconnectWallet}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl text-sm transition cursor-pointer">
            Disconnect ({address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ""})
          </button>
        ) : (
          <button
            onClick={connectWallet}
            className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-gray-950 font-bold rounded-xl text-sm transition shadow-lg shadow-yellow-500/20 cursor-pointer">
            Connect Wallet
          </button>
        )}
      </div>

      {/* Main Card Dashboard */}
      <div className="w-full max-w-md p-8 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl flex flex-col gap-6">
        <h2 className="text-xl font-semibold text-center">Dashboard Staking</h2>

        {isConnected ? (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center p-3 bg-gray-800 rounded-xl border border-gray-700">
              <span className="text-gray-400 text-sm">Wallet Balance:</span>
              <span className="font-bold text-yellow-300">
                {tokenBalance ? Number(formatEther(tokenBalance as bigint)).toFixed(2) : "0"}KHD
                </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-800 rounded-xl border border-gray-700">
              <span className="text-gray-400 text-sm">Staked Balance:</span>
              <span className="font-bold">
                {stakedBalance ? Number(formatEther(stakedBalance as bigint)).toFixed(2) : "0"}KHD
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-800 rounded-xl border border-gray-700">
              <span className="text-gray-400 text-sm">Pending Rewards:</span>
              <span className="font-bold text-green-400">
                {pendingRewards ? Number(formatEther(pendingRewards as bigint)).toFixed(2) : "0"}KHD
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <label className="text-gray-400">Amount to Stake / Withdraw</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-3 bg-gray-950 border border-gray-700 rounded-xl text-white outline-none focus:border-yellow-500 transition"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  onClick={handleApprove}
                  disabled={isLoading}
                  className="px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed">
                    {isLoading ? "Wait...." : "1.Approve"}
                  </button>
                <button 
                onClick={handleStake}
                disabled={isLoading}
                className="px-3 bg-yellow-500 hover:bg-yellow-400 text-gray-950 font-bold rounded-xl transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                  {isLoading ? "Wait...." : "2.Stake"}
                </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                <button 
                onClick={handleWithdraw}
                disabled={isLoading}
                className="px-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                  Withdraw
                </button>
                <button 
              onClick={handleClaimRewards}
              disabled={isLoading}
              className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                Claim Rewards
              </button>
              </div>

              </div>
        ) : (
          <div className="text-center py-10 text-gray-400">
            <p>Please connect your wallet to access the staking dashboard.</p>
          </div>
        )}
      </div>

      <div className="text-xs text-gray-600">
        Powered by Foundry and Next.js
      </div>
      </main>
  );
}

function refetchTokenBalance() {
  throw new Error("Function not implemented.");
}
