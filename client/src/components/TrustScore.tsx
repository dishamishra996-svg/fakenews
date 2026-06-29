"use client";

import { getTrustColor, getTrustLabel } from "@/lib/utils";

interface TrustScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function TrustScore({
  score,
  size = "md",
  showLabel = true,
}: TrustScoreProps) {
  const colorClass = getTrustColor(score);
  const label = getTrustLabel(score);

  const sizeClasses = {
    sm: { container: "w-12 h-12", text: "text-sm", labelText: "text-xs" },
    md: { container: "w-16 h-16", text: "text-lg", labelText: "text-sm" },
    lg: { container: "w-24 h-24", text: "text-3xl", labelText: "text-base" },
  };

  const s = sizeClasses[size];

  // Calculate circle properties
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const strokeColor =
    score >= 70
      ? "#10b981"
      : score >= 50
      ? "#f59e0b"
      : score >= 30
      ? "#f97316"
      : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`relative ${s.container}`}>
        <svg
          className="w-full h-full -rotate-90"
          viewBox="0 0 100 100"
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-zinc-200 dark:text-zinc-700"
          />
          {/* Score circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold ${s.text} ${colorClass}`}>{score}</span>
        </div>
      </div>
      {showLabel && (
        <span className={`font-medium ${s.labelText} ${colorClass}`}>
          {label}
        </span>
      )}
    </div>
  );
}
