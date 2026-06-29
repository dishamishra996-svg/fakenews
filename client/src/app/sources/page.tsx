"use client";

import { useState } from "react";
import { useWallet, isTrustedSource, getTrustedSource } from "@/hooks/contract";
import type { TrustedSource } from "@/hooks/contract";

const defaultSources = [
  {
    name: "Reuters",
    url: "https://reuters.com",
    description: "International news agency based in London, UK.",
  },
  {
    name: "Associated Press",
    url: "https://apnews.com",
    description: "American nonprofit news agency headquartered in New York.",
  },
  {
    name: "BBC News",
    url: "https://bbc.com/news",
    description: "British public service broadcaster.",
  },
  {
    name: "AFP",
    url: "https://afp.com",
    description: "Agence France-Presse, global news agency.",
  },
];

export default function SourcesPage() {
  const { address, isConnected } = useWallet();
  const [searchAddr, setSearchAddr] = useState("");
  const [checkedSource, setCheckedSource] = useState<{
    address: string;
    trustInfo: TrustedSource | null;
    isTrusted: boolean;
  } | null>(null);
  const [checking, setChecking] = useState(false);

  async function handleCheckSource() {
    if (!searchAddr.trim()) return;
    setChecking(true);

    try {
      const trusted = await isTrustedSource(searchAddr.trim());
      let trustInfo: TrustedSource | null = null;
      if (trusted) {
        trustInfo = await getTrustedSource(searchAddr.trim());
      }
      setCheckedSource({
        address: searchAddr.trim(),
        trustInfo,
        isTrusted: trusted,
      });
    } catch {
      setCheckedSource({
        address: searchAddr.trim(),
        trustInfo: null,
        isTrusted: false,
      });
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">
          Trusted News Sources
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Verified news sources and organizations on the Stellar network.
          Content from these sources gets automatically verified.
        </p>
      </div>

      {/* Check Source */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm mb-8">
        <h2 className="font-semibold text-zinc-900 dark:text-white mb-4">
          Check a Source Address
        </h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={searchAddr}
            onChange={(e) => setSearchAddr(e.target.value)}
            placeholder="Enter Stellar address (C...)"
            className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
          />
          <button
            onClick={handleCheckSource}
            disabled={checking || !searchAddr.trim()}
            className="px-6 py-2.5 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {checking ? "Checking..." : "Check"}
          </button>
        </div>

        {checkedSource && (
          <div className="mt-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
            {checkedSource.isTrusted && checkedSource.trustInfo ? (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-emerald-700 dark:text-emerald-300">
                    Verified Source: {checkedSource.trustInfo.name}
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {checkedSource.trustInfo.url}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-700 text-zinc-400">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-zinc-700 dark:text-zinc-300">
                    Not a verified source
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    This address is not registered as a trusted source.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reputable Sources List */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
        <h2 className="font-semibold text-zinc-900 dark:text-white mb-4">
          Major News Agencies
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          These sources are commonly accepted as reliable. On-chain verification
          will be available once added by the contract admin.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          {defaultSources.map((source) => (
            <div
              key={source.name}
              className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">
                  {source.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-medium text-zinc-900 dark:text-white text-sm">
                    {source.name}
                  </h3>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {source.url.replace("https://", "")}
                  </a>
                </div>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {source.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
