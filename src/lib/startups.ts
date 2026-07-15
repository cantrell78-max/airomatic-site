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

export interface Startup {
  id: string;
  date: string;
  companyName: string;
  headline: string;
  round: string;
  description: string;
  founderName: string;
  founderTitle: string | null;
  founderQuote: string;
  investorQuote: string;
  /** Optional display name for the investor quote attribution */
  investorName?: string | null;
  /** Optional firm for the investor quote attribution */
  investorFirm?: string | null;
  verticals: string[];
  /** Exactly 5 hashtags for social (include leading #) */
  hashtags?: string[];
  /** Ready-to-post X copy for the Agentic AI Startup News account */
  xPost?: string;
  image: string;
}

/** Attribution line for the investor quote footer (modal). */
export function formatInvestorAttribution(startup: {
  investorName?: string | null;
  investorFirm?: string | null;
}): string {
  const name = startup.investorName?.trim() || "";
  const firm = startup.investorFirm?.trim() || "";
  if (name && firm) return `${name} · ${firm}`;
  if (name) return name;
  if (firm) return firm;
  return "Investor";
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
