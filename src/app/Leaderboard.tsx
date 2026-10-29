"use client"

import { useState, useEffect } from "react";

export default function Leaderboard() {
     const [leaders, setLeader] = useState<any[]>([]);
     const [loading, setLoading] = useState(true);

     const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leaderboard');
      if (res.ok) {
        const data = await res.json();
        setLeader(data);
      }
    } catch (error) {
      console.error("Error fetching Leaderboard kehed!!:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (
    <div className="w-full max-w-md p-6 mt-6 bg-gray-900 border border-yellow-500/50 rounded-2xl shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-yellow-400"> Top Staker Para Keheders!!</h2>
            <button 
              onClick={fetchLeaderboard}
              className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg border border-gray-600 transtition">
                Refresh
                </button>
                </div>
                
                {loading? (
                  <p className="text-center text-gray-400 text-sm py-4">Loading data...</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {leaders.map((user, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-800 rounded-lg border border-gray-700 hover:border-yellow-500/30 transition">
                        <div className="flex items-center gap-3">
                          <span className={`font-bold text-lg ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-amber-600' : 'text-gray-600'}`}>
                            #{index + 1}
                          </span>
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm">{user.username || "Anon Kehed"}</span>
                            <span className="text-[10px] text-gray-500">{user.wallet_address.slice(0,6)}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-blue-400">{user.points} Pts</span>
                          <span className="text-[10px] text-gray-400">Lv. {user.level || 1}</span>
                        </div>
                        </div>
                    ))}
                  </div>
                )}
                </div>

  );
}