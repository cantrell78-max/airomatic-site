/** Site-wide settings. Override with .env — see env.example in project root. */
export const site = {
  name: "Airomatic",
  tagline: "AI tools & live-built software",
  url: "https://airomatic.ai",
  location: "Bend, Oregon",
  formspreeId: import.meta.env.PUBLIC_FORMSPREE_ID ?? "",
  youtubeUrl:
    import.meta.env.PUBLIC_YOUTUBE_URL ?? "https://www.youtube.com/@airomaticAI",
  /** Featured live stream or VOD on /live/ — override via PUBLIC_YOUTUBE_LIVE_ID */
  youtubeLiveId: import.meta.env.PUBLIC_YOUTUBE_LIVE_ID ?? "c8LH2OFCFVE",
  contactEmail: import.meta.env.PUBLIC_CONTACT_EMAIL ?? "",
} as const;

export const formspreeAction = site.formspreeId
  ? `https://formspree.io/f/${site.formspreeId}`
  : null;