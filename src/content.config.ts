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
    /** X / Twitter status id — rendered as an embed above the article */
    tweetId: z.string().optional(),
    embedUrl: z.string().url().optional(),
    /** Optional absolute or site-relative OG image override */
    ogImage: z.string().optional(),
    /** Startup ids from src/data/startups.json to embed as cards in the post */
    featuredStartupIds: z.array(z.string()).optional(),
    /** English title when the canonical post is not English */
    titleEn: z.string().optional(),
    /** English description when the canonical post is not English */
    descriptionEn: z.string().optional(),
    /** Initial article language when a matching blog-en translation exists */
    defaultLang: z.enum(["en", "zh"]).optional(),
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

const blogEn = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog-en" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
  }),
});

export const collections = { blog, mathBlog, blogEn };