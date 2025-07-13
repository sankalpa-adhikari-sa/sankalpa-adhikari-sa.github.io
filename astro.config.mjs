// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import starlightThemeRapide from "starlight-theme-rapide";
import starlightSidebarTopics from "starlight-sidebar-topics";
import starlightAuthors from "./src/plugins/starlightAuthors";

import react from "@astrojs/react";

import markdoc from "@astrojs/markdoc";

const AVATAR_DIR = "/images/authors";
// https://astro.build/config
export default defineConfig({
  site: "/sankalpa-adhikari-sa.github.io/",
  redirects: {
    "en/all-docs": "/en/all-docs/1",
    "ne/all-docs": "/ne/all-docs/1",
  },
  integrations: [
    icon(),
    starlight({
      title: {
        en: "Sankalpa Adhikari",
        ne: "संकल्प अधिकारी",
      },
      head: [
        {
          tag: "link",
          attrs: {
            rel: "icon",
            type: "image/png",
            href: "/images/authors/avatar_default.png",
          },
        },
      ],
      editLink: {
        baseUrl:
          "https://github.com/sankalpa-adhikari-sa/sankalpa-adhikari-sa.github.io",
      },
      defaultLocale: "en",
      locales: {
        en: {
          label: "English",
        },
        ne: {
          label: "नेपाली",
          lang: "ne",
        },
      },
      lastUpdated: true,
      components: {
        Sidebar: "./src/components/overrides/Sidebar.astro",
        PageTitle: "./src/components/overrides/PageTitle.astro",
        MarkdownContent: "./src/components/overrides/MarkdownContent.astro",
      },

      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/sankalpa-adhikari-sa",
        },
      ],

      customCss: [
        "./src/styles/global.css",
        "./src/styles/app.css",
        "/fonts/ArchitectsDaughter-Regular.ttf",
      ],

      plugins: [
        starlightAuthors({
          authors: {
            sankalpa: {
              name: "Sankalpa Adhikari",
              title: "Agricultural Engineer",
              bio: `Just an average engineer.`,
              //  either url or inside public folder like this "images/authors/sankalpa.jpg"" is image inside public folder
              picture: `${AVATAR_DIR}/avatar_default.png`,
              socials: {
                linkedin:
                  "https://www.linkedin.com/in/sankalpa-adhikari-b78823238",
                github: "https://github.com/sankalpa-adhikari-sa",
              },
            },
          },
        }),
        starlightSidebarTopics([
          {
            label: {
              en: "All Posts",
              ne: "सबै पोस्टहरू",
            },
            id: "all_docs",
            link: "/all-docs/1",
            icon: "local:home",

            items: [],
          },
          {
            label: {
              en: "Guides",
              ne: "मार्गदर्शन",
            },
            id: "guides",
            link: "/guides/",
            icon: "open-book",
            items: [
              {
                label: "Guides",
                translations: {
                  en: "Guides",
                  ne: "मार्गदर्शन",
                },
                autogenerate: { directory: "guides" },
              },
            ],
          },

          {
            label: {
              en: "Projects",
              ne: "संदर्भ",
            },
            link: "/projects/",
            icon: "rocket",
            id: "projects",
            items: [
              {
                label: "Projects",
                translations: {
                  en: "Projects",
                  ne: "व्यंजनहरू",
                },
                autogenerate: { directory: "projects" },
              },
            ],
          },
          {
            label: {
              en: "Others",
              ne: "संदर्भ",
            },
            link: "/others/",
            icon: "local:globe",
            id: "others",
            items: [
              {
                label: "Others",
                translations: {
                  en: "Others",
                  ne: "व्यंजनहरू",
                },
                autogenerate: { directory: "others" },
              },
            ],
          },
        ]),
        starlightThemeRapide(),
      ],
    }),
    react(),
    markdoc(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
