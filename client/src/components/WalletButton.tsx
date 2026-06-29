"use client";

import { useWallet } from "@/hooks/contract";
import { shortenAddress } from "@/lib/utils";

export default function WalletButton() {
  const { address, isConnected, isConnecting, connect } = useWallet();

  return (
    <button
      onClick={connect}
      disabled={isConnected || isConnecting}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
        ${
          isConnected
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
            : "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 shadow-sm"
        }
        disabled:opacity-70 disabled:cursor-not-allowed
      `}
    >
      {isConnecting ? (
        <>
          <svg
            className="animate-spin h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Connecting...
        </>
      ) : isConnected ? (
        <>
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          {shortenAddress(address!)}
        </>
      ) : (
        <>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
            <path d="M9 12h6" />
            <path d="M12 9v6" />
          </svg>
          Connect Wallet
        </>
      )}
    </button>
  );
}
