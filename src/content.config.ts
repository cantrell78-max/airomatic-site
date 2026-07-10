import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    youtubeId: z.string().optional(),
    embedUrl: z.string().url().optional(),
    /** Optional absolute or site-relative OG image override */
    ogImage: z.string().optional(),
    /** Startup ids from src/data/startups.json to embed as cards in the post */
    featuredStartupIds: z.array(z.string()).optional(),
  }),
});

const mathBlog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/math-blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
  }),
});

export const collections = { blog, mathBlog };