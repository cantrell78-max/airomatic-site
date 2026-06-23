/** Site-wide settings. Override with .env — see env.example in project root. */
export const site = {
  name: "Airomatic",
  tagline: "AI tools & live-built software",
  url: "https://airomatic.ai",
  location: "Bend, Oregon",
  formspreeId: import.meta.env.PUBLIC_FORMSPREE_ID ?? "",
  youtubeUrl: import.meta.env.PUBLIC_YOUTUBE_URL ?? "",
  /** Optional: embed a live stream or featured VOD on /live/ */
  youtubeLiveId: import.meta.env.PUBLIC_YOUTUBE_LIVE_ID ?? "",
  contactEmail: import.meta.env.PUBLIC_CONTACT_EMAIL ?? "",
} as const;

export const formspreeAction = site.formspreeId
  ? `https://formspree.io/f/${site.formspreeId}`
  : null;