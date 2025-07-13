import { z } from "astro/zod";
import type { ImageMetadata } from "astro";
export const blogAuthorSchema = z.object({
  name: z.string().min(1),
  title: z.string().optional(),
  picture: z.union([z.custom<ImageMetadata>(), z.string()]).optional(),
  url: z.string().url().optional(),
  bio: z.string().optional(),
  socials: z
    .object({
      linkedin: z.string().url().optional(),
      github: z.string().url().optional(),
    })
    .optional(),
});

export const StarlightAuthorsConfigSchema = z.object({
  authors: z.record(z.string(), blogAuthorSchema).optional(),
});

export type BlogAuthor = z.infer<typeof blogAuthorSchema>;
export type StarlightAuthorsConfig = z.infer<
  typeof StarlightAuthorsConfigSchema
>;

export const authorReferenceSchema = z.union([z.string(), blogAuthorSchema]);

export type AuthorReference = z.infer<typeof authorReferenceSchema>;
