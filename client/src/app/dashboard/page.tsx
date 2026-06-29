"use client";

import { useState, useEffect } from "react";
import { useWallet, getUserReputation, getContentCount } from "@/hooks/contract";
import { shortenAddress } from "@/lib/utils";

export default function DashboardPage() {
  const { address, isConnected, connect } = useWallet();
  const [reputation, setReputation] = useState<number>(0);
  const [totalContent, setTotalContent] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!address) {
        setLoading(false);
        return;
      }
      try {
        const [rep, count] = await Promise.all([
          getUserReputation(address),
          getContentCount(),
        ]);
        setReputation(rep);
        setTotalContent(count);
      } catch {
        // Contract not deployed
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [address]);

  if (!isConnected) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-12 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
            Connect Your Wallet
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-6">
            Connect Freighter to view your reputation and activity.
          </p>
          <button
            onClick={connect}
            className="px-6 py-2.5 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-xl text-sm font-medium hover:opacity-90 transition-all"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Your contribution to the TrustCheck platform.
        </p>
      </div>

      {/* User Info */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-lg">
            {address ? address.charAt(address.length - 2).toUpperCase() : "?"}
          </div>
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Connected as</p>
            <p className="font-semibold text-zinc-900 dark:text-white font-mono">
              {address ? shortenAddress(address) : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Reputation</p>
              <p className="text-xl font-bold text-zinc-900 dark:text-white">
                {loading ? "..." : reputation}
              </p>
            </div>
          </div>
          <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(reputation, 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Total Content
              </p>
              <p className="text-xl font-bold text-zinc-900 dark:text-white">
                {loading ? "..." : totalContent}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Network
              </p>
              <p className="text-xl font-bold text-zinc-900 dark:text-white">
                Testnet
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How to earn reputation */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
        <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">
          Earn Reputation
        </h3>
        <div className="space-y-3">
          {[
            {
              action: "Submit content",
              reward: "+10 reputation",
              icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              ),
            },
            {
              action: "Verify content",
              reward: "+5 reputation",
              icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              ),
            },
          ].map((item) => (
            <div
              key={item.action}
              className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50"
            >
              <div className="flex items-center gap-3">
                <div className="text-emerald-600 dark:text-emerald-400">
                  {item.icon}
                </div>
                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                  {item.action}
                </span>
              </div>
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                {item.reward}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
