export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function shortenAddress(address: string): string {
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatTimestamp(ts: number | bigint): string {
  return new Date(Number(ts) * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getTrustColor(score: number): string {
  if (score >= 70) return "text-emerald-500";
  if (score >= 50) return "text-amber-500";
  if (score >= 30) return "text-orange-500";
  return "text-red-500";
}

export function getTrustBgColor(score: number): string {
  if (score >= 70) return "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800";
  if (score >= 50) return "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800";
  if (score >= 30) return "bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800";
  return "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800";
}

export function getTrustLabel(score: number): string {
  if (score >= 70) return "Verified";
  if (score >= 50) return "Likely True";
  if (score >= 30) return "Suspicious";
  return "Falsified";
}

export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case "verified": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
    case "falsified": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    case "disputed": return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
    default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }
}
