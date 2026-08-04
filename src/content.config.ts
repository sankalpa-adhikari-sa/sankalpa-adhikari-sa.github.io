import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const articles = defineCollection({
	loader: glob({
		pattern: "**/[^_]*.{md,mdx}",
		base: "./src/content/articles",
	}),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			subtitle: z.string().optional(),
			slug: z
				.string()
				.optional()
				.describe("Custom URL slug (defaults to filename)"),
			draft: z.boolean().default(false),
			toc: z
				.boolean()
				.default(false)
				.describe("Show table of contents sidebar on wide viewports"),
			description: z.string().optional(),
			pubDate: z.coerce.date(),
			lastUpdated: z.coerce.date().optional(),
			cover: image().optional(),
			coverAlt: z.string().optional(),
			tags: z.array(z.string()).optional(),
			readingTime: z.boolean().default(false),
		}),
});

const projects = defineCollection({
	loader: glob({
		pattern: "**/[^_]*.{md,mdx}",
		base: "./src/content/projects",
	}),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			alias: z.string().optional(),
			subtitle: z.string().optional(),
			slug: z
				.string()
				.optional()
				.describe("Custom URL slug (defaults to filename)"),
			draft: z.boolean().default(false),
			toc: z
				.boolean()
				.default(false)
				.describe("Show table of contents sidebar on wide viewports"),
			description: z.string().optional(),
			pubDate: z.coerce.date(),
			lastUpdated: z.coerce.date().optional(),
			cover: image().optional(),
			coverAlt: z.string().optional(),
			tags: z.array(z.string()).optional(),
			readingTime: z.boolean().default(false),
		}),
});

const work = defineCollection({
	loader: glob({
		pattern: "**/[^_]*.{md,mdx}",
		base: "./src/content/work",
	}),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			alias: z.string().optional(),
			subtitle: z.string().optional(),
			slug: z
				.string()
				.optional()
				.describe("Custom URL slug (defaults to filename)"),
			draft: z.boolean().default(false),
			toc: z
				.boolean()
				.default(false)
				.describe("Show table of contents sidebar on wide viewports"),
			description: z.string().optional(),
			pubDate: z.coerce.date(),
			lastUpdated: z.coerce.date().optional(),
			cover: image().optional(),
			coverAlt: z.string().optional(),
			tags: z.array(z.string()).optional(),
			readingTime: z.boolean().default(false),
		}),
});

export const collections = { articles, projects, work };
