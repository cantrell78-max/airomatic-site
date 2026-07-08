/** Site-wide settings. Override with .env — see env.example in project root. */
export const site = {
  name: "Airomatic",
  tagline: "AI tools & live-built software",
  /** Shown on the default Open Graph preview image */
  ogTagline: "AI That Smells Success",
  url: "https://airomatic.ai",
  ogImage: "/og-image.jpg",
  ogImageWidth: 1200,
  ogImageHeight: 630,
  location: "Bend, Oregon",
  formspreeId: import.meta.env.PUBLIC_FORMSPREE_ID ?? "mbdvygbb",
  youtubeUrl:
    import.meta.env.PUBLIC_YOUTUBE_URL ?? "https://www.youtube.com/@airomaticAI",
  /** Featured live stream or VOD on /live/ — override via PUBLIC_YOUTUBE_LIVE_ID */
  youtubeLiveId: import.meta.env.PUBLIC_YOUTUBE_LIVE_ID ?? "KRNjt5EFqOA",
  contactEmail: import.meta.env.PUBLIC_CONTACT_EMAIL ?? "adam@airomatic.ai",
} as const;

export const formspreeAction = site.formspreeId
  ? `https://formspree.io/f/${site.formspreeId}`
  : null;