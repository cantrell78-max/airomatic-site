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
  verticals: string[];
  image: string;
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
  "Insurtech",
  "Dev Tools",
  "Real Estate",
  "Proptech",
  "Escrow",
  "Voice AI",
  "Sovereign Entities",
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
