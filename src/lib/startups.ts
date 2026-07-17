/**
 * Agentic AI Startup News — data helpers
 *
 * How to add a new batch:
 * 1. Append (or prepend) new objects to `src/data/startups.json`
 * 2. Drop matching portrait images into `public/images/startups/`
 *    (filenames must match the `image` path, e.g. `/images/startups/founder-slug.jpg`)
 * 3. Rebuild / redeploy — the /startups page renders all entries automatically
 *
 * Source batch folder (archive): projects/agentic-ai-startup-news/
 */

import startupsData from "../data/startups.json";

/** Wire story shape — optional; missing/unknown → raise (legacy cards). */
export type StartupNewsType =
  | "raise"
  | "stealth"
  | "extension"
  | "strategic"
  | "acquisition"
  | "downround"
  | "secondary"
  | "grant";

export interface Startup {
  id: string;
  date: string;
  companyName: string;
  headline: string;
  /** Deal chip text, e.g. "$48M Series A" or "$52M · Emerged from stealth" */
  round: string;
  description: string;
  founderName: string;
  founderTitle: string | null;
  founderQuote: string;
  investorQuote: string;
  /** Optional display name for the second-voice quote attribution */
  investorName?: string | null;
  /** Optional firm for the second-voice quote attribution */
  investorFirm?: string | null;
  /**
   * Story type for chrome / second-voice role.
   * Omit on legacy cards (treated as "raise").
   */
  newsType?: StartupNewsType | null;
  verticals: string[];
  /** Exactly 5 hashtags for social (include leading #) */
  hashtags?: string[];
  /** Ready-to-post X copy for the Agentic AI Startup News account */
  xPost?: string;
  image: string;
}

const NEWS_TYPES: readonly StartupNewsType[] = [
  "raise",
  "stealth",
  "extension",
  "strategic",
  "acquisition",
  "downround",
  "secondary",
  "grant",
] as const;

export function resolveNewsType(
  startup: Pick<Startup, "newsType"> | { newsType?: string | null }
): StartupNewsType {
  const t = (startup.newsType || "raise").toLowerCase();
  // tender → secondary alias
  if (t === "tender") return "secondary";
  if ((NEWS_TYPES as readonly string[]).includes(t)) {
    return t as StartupNewsType;
  }
  return "raise";
}

/** Short label for optional type chrome (empty for plain raises). */
export function formatNewsTypeLabel(
  startup: Pick<Startup, "newsType"> | { newsType?: string | null }
): string {
  switch (resolveNewsType(startup)) {
    case "stealth":
      return "Stealth";
    case "extension":
      return "Extension";
    case "strategic":
      return "Strategic";
    case "acquisition":
      return "M&A";
    case "downround":
      return "Down round";
    case "secondary":
      return "Secondary";
    case "grant":
      return "Grant";
    default:
      return "";
  }
}

/**
 * Role word for the second blockquote when name/firm are missing.
 * With name/firm present, prefer formatInvestorAttribution (name · firm).
 */
export function formatSecondVoiceRole(
  startup: Pick<Startup, "newsType"> | { newsType?: string | null }
): string {
  switch (resolveNewsType(startup)) {
    case "stealth":
      return "Seed lead";
    case "extension":
      return "Returning investor";
    case "strategic":
      return "Strategic";
    case "acquisition":
      return "Acquirer";
    case "downround":
      return "Investor";
    case "secondary":
      return "Secondary buyer";
    case "grant":
      return "Program lead";
    default:
      return "Investor";
  }
}

/** Attribution line for the second quote footer (modal / detail). */
export function formatInvestorAttribution(startup: {
  investorName?: string | null;
  investorFirm?: string | null;
  newsType?: string | null;
}): string {
  const name = startup.investorName?.trim() || "";
  const firm = startup.investorFirm?.trim() || "";
  if (name && firm) return `${name} · ${firm}`;
  if (name) return name;
  if (firm) return firm;
  return formatSecondVoiceRole(startup);
}

/** Parse `round` strings like "$98M Series B" / "$1.15B Series D" → USD millions. */
export function parseRoundMillions(round: string): number | null {
  if (!round) return null;
  const m = round.match(/\$?\s*([\d,.]+)\s*([MmBb]|million|billion)?/i);
  if (!m) return null;
  const num = parseFloat(m[1].replace(/,/g, ""));
  if (Number.isNaN(num)) return null;
  const unit = (m[2] || "M").toLowerCase();
  if (unit.startsWith("b")) return num * 1000;
  return num;
}

export type ArchiveStats = {
  count: number;
  totalRaisedMillions: number;
  totalRaisedLabel: string;
  topVerticals: { label: string; count: number }[];
  newsTypeCounts: { type: StartupNewsType; label: string; count: number }[];
};

function formatBillionsLabel(millions: number): string {
  if (millions >= 1000) {
    const b = millions / 1000;
    const rounded = b >= 10 ? b.toFixed(1) : b.toFixed(2);
    return `$${rounded.replace(/\.?0+$/, "")}B`;
  }
  return `$${Math.round(millions)}M`;
}

/** Desk chrome: totals and patterns (page-level, not per-card satire). */
export function getArchiveStats(list: Startup[] = startups): ArchiveStats {
  let total = 0;
  const verticalCounts = new Map<string, number>();
  const typeCounts: Record<StartupNewsType, number> = {
    raise: 0,
    stealth: 0,
    extension: 0,
    strategic: 0,
    acquisition: 0,
    downround: 0,
    secondary: 0,
    grant: 0,
  };

  for (const s of list) {
    const mil = parseRoundMillions(s.round);
    if (mil != null) total += mil;
    for (const v of s.verticals || []) {
      const key = v.trim();
      if (!key) continue;
      verticalCounts.set(key, (verticalCounts.get(key) || 0) + 1);
    }
    typeCounts[resolveNewsType(s)] += 1;
  }

  const topVerticals = [...verticalCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 5)
    .map(([label, count]) => ({ label, count }));

  const typeLabels: Record<StartupNewsType, string> = {
    raise: "Raises",
    stealth: "Stealth",
    extension: "Extensions",
    strategic: "Strategic",
    acquisition: "M&A",
    downround: "Down rounds",
    secondary: "Secondaries",
    grant: "Grants",
  };

  const newsTypeCounts = (
    Object.keys(typeCounts) as StartupNewsType[]
  )
    .filter((t) => typeCounts[t] > 0)
    .map((type) => ({
      type,
      label: typeLabels[type],
      count: typeCounts[type],
    }))
    .sort((a, b) => b.count - a.count);

  return {
    count: list.length,
    totalRaisedMillions: total,
    totalRaisedLabel: formatBillionsLabel(total),
    topVerticals,
    newsTypeCounts,
  };
}

export const startups: Startup[] = startupsData as Startup[];

/** Newest first */
export function getStartupsSorted(): Startup[] {
  return [...startups].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/**
 * Curated filter chips for the UI. Matching is case-insensitive and checks
 * whether any vertical on a card contains the filter label as a substring
 * (so "Dev Tools" also matches "Agentic Dev Tools", "Quantum" matches
 * "Quantum Command" / "Quantum Risk", etc.).
 */
export const STARTUP_FILTERS = [
  "All",
  "Quantum",
  "Defense",
  "AI SOC",
  "Security",
  "Insurtech",
  "Fintech",
  "Legal AI",
  "Dev Tools",
  "Agentic CX",
  "Real Estate",
  "Proptech",
  "Escrow",
  "Voice AI",
  "Sovereign Entities",
  "Healthtech",
  "Agent Infra",
  "Fincrime",
  "Payments",
  "Buy-Side Research",
  "Ship Governance",
] as const;

export type StartupFilter = (typeof STARTUP_FILTERS)[number];

export function startupMatchesFilter(
  startup: Startup,
  filter: string
): boolean {
  if (!filter || filter === "All") return true;
  const needle = filter.toLowerCase();
  return startup.verticals.some((v) => v.toLowerCase().includes(needle));
}

export function formatStartupDate(date: string): string {
  return new Date(date + "T12:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** URL slug from company name, e.g. "Baremesh" → "baremesh" */
export function getStartupSlug(startup: Pick<Startup, "companyName">): string {
  return startup.companyName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getStartupBySlug(slug: string): Startup | undefined {
  return startups.find((s) => getStartupSlug(s) === slug);
}

/** All startups with their public slugs (for static paths / directory). */
export function getStartupsWithSlugs(): { startup: Startup; slug: string }[] {
  return getStartupsSorted().map((startup) => ({
    startup,
    slug: getStartupSlug(startup),
  }));
}
