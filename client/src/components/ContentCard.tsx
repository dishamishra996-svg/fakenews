"use client";

import { ContentItem } from "@/hooks/contract";
import TrustScore from "./TrustScore";
import {
  formatTimestamp,
  getStatusBadgeClass,
  shortenAddress,
} from "@/lib/utils";

interface ContentCardProps {
  content: ContentItem;
  onVerify?: (contentId: string) => void;
  onReport?: (contentId: string) => void;
}

export default function ContentCard({
  content,
  onVerify,
  onReport,
}: ContentCardProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        {/* Trust Score */}
        <TrustScore score={content.trust_score} />

        {/* Content Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                content.status
              )}`}
            >
              {content.status}
            </span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">
              {content.content_type}
            </span>
          </div>

          <h3 className="font-semibold text-zinc-900 dark:text-white truncate mb-1">
            {content.id}
          </h3>

          <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate font-mono">
            {content.content_hash}
          </p>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-400 dark:text-zinc-500">
            <span>
              Submitted by {shortenAddress(content.submitter)}
            </span>
            <span>{formatTimestamp(content.timestamp)}</span>
            <span>{content.verification_count} verifications</span>
            <span>{content.report_count} reports</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex gap-2">
        {onVerify && (
          <button
            onClick={() => onVerify(content.id)}
            className="flex-1 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 dark:text-emerald-400 rounded-xl text-sm font-medium transition-colors"
          >
            Verify
          </button>
        )}
        {onReport && (
          <button
            onClick={() => onReport(content.id)}
            className="flex-1 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/30 dark:hover:bg-red-950/50 dark:text-red-400 rounded-xl text-sm font-medium transition-colors"
          >
            Report
          </button>
        )}
      </div>
    </div>
  );
}
