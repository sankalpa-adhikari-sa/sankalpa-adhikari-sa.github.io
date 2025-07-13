import { defineCollection } from "astro:content";
import { docsLoader, i18nLoader } from "@astrojs/starlight/loaders";
import { docsSchema, i18nSchema } from "@astrojs/starlight/schema";
import { z } from "astro:schema";
import { topicSchema } from "starlight-sidebar-topics/schema";

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: ({ image }) => {
        return topicSchema.extend({
          created: z.date().optional(),
          subtitle: z.string().optional(),
          lastUpdated: z.union([z.date(), z.boolean()]).optional(),
          readingTime: z.boolean().default(false),
          coverImage: image().optional(),
          coverImageAlt: z.string().optional(),
          tags: z.array(z.string()).optional(),
          topic: z.string().optional(),
          // golb=false so that it will be skipped in creating recent docs or all docs
          glob: z.boolean().default(true),
          authors: z
            .array(
              z.union([
                z.string(),
                z.object({
                  name: z.string().min(1),
                  title: z.string().optional(),
                  picture: image().optional(),
                  url: z.string().url().optional(),
                  bio: z.string().optional(),
                  socials: z
                    .object({
                      linkedin: z.string().url().optional(),
                      github: z.string().url().optional(),
                    })
                    .optional(),
                }),
              ]),
            )
            .optional(),
        });
      },
    }),
  }),
  i18n: defineCollection({
    loader: i18nLoader(),
    schema: i18nSchema({
      extend: z.object({
        "readingTime.text": z.string().optional(),
        "component.preview": z.string().optional(),
        "page.recentPosts": z.string().optional(),
        "page.allPosts": z.string().optional(),
        "page.noPostsAvailabeTitle": z.string().optional(),
        "page.noPostsAvailabeBody1": z.string().optional(),
        "page.noPostsAvailabeBody2": z.string().optional(),
      }),
    }),
  }),
};
