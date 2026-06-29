"use client";

import { useState } from "react";
import { useWallet } from "@/hooks/contract";
import {
  submitContent,
  verifyContent,
  reportContent,
  getContent,
} from "@/hooks/contract";
import ContentCard from "./ContentCard";
import type { ContentItem } from "@/hooks/contract";

export default function Contract() {
  const { address, isConnected } = useWallet();
  const [mode, setMode] = useState<"submit" | "verify" | "report">("verify");
  const [contentId, setContentId] = useState("");
  const [contentHash, setContentHash] = useState("");
  const [contentType, setContentType] = useState("text");
  const [trustScore, setTrustScore] = useState(50);
  const [result, setResult] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  async function handleLookup() {
    if (!contentId.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const content = await getContent(contentId.trim());
      if (content) {
        setResult(content);
      } else {
        setError("Content not found on-chain.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch content");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!address || !contentId.trim() || !contentHash.trim()) return;
    setLoading(true);
    setError(null);
    setTxHash(null);

    try {
      const hash = await submitContent(
        address,
        contentId.trim(),
        contentHash.trim(),
        contentType
      );
      setTxHash(hash);
      // Refresh content
      const content = await getContent(contentId.trim());
      if (content) setResult(content);
    } catch (err: any) {
      setError(err.message || "Transaction failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(score: number) {
    if (!address || !contentId.trim()) return;
    setLoading(true);
    setError(null);
    setTxHash(null);

    try {
      const hash = await verifyContent(address, contentId.trim(), score);
      setTxHash(hash);
      const content = await getContent(contentId.trim());
      if (content) setResult(content);
    } catch (err: any) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleReport() {
    if (!address || !contentId.trim()) return;
    setLoading(true);
    setError(null);
    setTxHash(null);

    try {
      const hash = await reportContent(address, contentId.trim());
      setTxHash(hash);
      const content = await getContent(contentId.trim());
      if (content) setResult(content);
    } catch (err: any) {
      setError(err.message || "Report failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <div className="flex gap-2">
        {(["verify", "submit", "report"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`
              px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize
              ${
                mode === m
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              }
            `}
          >
            {m === "verify" ? "Check Content" : m === "submit" ? "Submit" : "Report"}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-4">
        {/* Content ID */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Content ID
          </label>
          <input
            type="text"
            value={contentId}
            onChange={(e) => setContentId(e.target.value)}
            placeholder="e.g., CONTENT-001"
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
          />
        </div>

        {/* Submit mode extra fields */}
        {mode === "submit" && (
          <>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Content Hash
              </label>
              <input
                type="text"
                value={contentHash}
                onChange={(e) => setContentHash(e.target.value)}
                placeholder="SHA-256 or unique hash"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Content Type
              </label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
              >
                <option value="text">Text / Article</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="link">Link / URL</option>
              </select>
            </div>
          </>
        )}

        {/* Verify mode - trust score slider */}
        {mode === "verify" && (
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Trust Score: <span className="font-bold">{trustScore}</span>/100
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={trustScore}
              onChange={(e) => setTrustScore(Number(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-zinc-200 dark:bg-zinc-700 accent-emerald-500"
            />
            <div className="flex justify-between text-xs text-zinc-400 mt-1">
              <span>False</span>
              <span>Verified</span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex gap-3">
          {mode === "verify" && (
            <>
              <button
                onClick={handleLookup}
                disabled={loading || !contentId.trim()}
                className="flex-1 px-4 py-2.5 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? "Checking..." : "Look Up Content"}
              </button>
              {result && isConnected && (
                <button
                  onClick={() => handleVerify(trustScore)}
                  disabled={loading}
                  className="px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 disabled:opacity-50 transition-all"
                >
                  Submit Score
                </button>
              )}
            </>
          )}
          {mode === "submit" && (
            <button
              onClick={handleSubmit}
              disabled={loading || !isConnected || !contentId.trim() || !contentHash.trim()}
              className="flex-1 px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "Submitting..." : "Submit Content"}
            </button>
          )}
          {mode === "report" && (
            <button
              onClick={handleReport}
              disabled={loading || !isConnected || !contentId.trim()}
              className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "Reporting..." : "Report Content"}
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Transaction hash */}
      {txHash && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3 text-sm">
          <span className="text-emerald-700 dark:text-emerald-400 font-medium">
            Transaction submitted:{" "}
          </span>
          <code className="text-xs font-mono text-emerald-600 dark:text-emerald-300 break-all">
            {txHash}
          </code>
        </div>
      )}

      {/* Result */}
      {result && <ContentCard content={result} />}
    </div>
  );
}
