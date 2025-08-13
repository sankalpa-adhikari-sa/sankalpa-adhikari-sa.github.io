// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import starlightThemeRapide from "starlight-theme-rapide";
import starlightSidebarTopics from "starlight-sidebar-topics";
import starlightAuthors from "./src/plugins/starlightAuthors";
import starlightGiscus from "./src/plugins/starlightGiscus";

import react from "@astrojs/react";

import markdoc from "@astrojs/markdoc";

const AVATAR_DIR = "/images/authors";
// https://astro.build/config
export default defineConfig({
  site: "https://github.com/sankalpa-adhikari-sa/sankalpa-adhikari-sa.github.io",
  redirects: {
    "en/all-docs": "/en/all-docs/1",
    "ne/all-docs": "/ne/all-docs/1",
    "/": "/en/",
  },
  prefetch: true,

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
        {
          tag: "script",
          attrs: {
            "data-goatcounter":
              "https://sankalpa-adhikari-sa.goatcounter.com/count",
            async: true,
            src: "//gc.zgo.at/count.js",
          },
        },
      ],
      editLink: {
        baseUrl:
          "https://github.com/sankalpa-adhikari-sa/sankalpa-adhikari-sa.github.io/tree/main",
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
        {
          icon: "linkedin",
          label: "Linkedin",
          href: "https://www.linkedin.com/in/sankalpa-adhikari-b78823238",
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
            icon: "mdi:home",

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
              ne: "परियोजना",
            },
            link: "/projects/",
            icon: "rocket",
            id: "projects",
            items: [
              {
                label: "Projects",
                translations: {
                  en: "Projects",
                  ne: "परियोजनाहरू",
                },
                autogenerate: { directory: "projects" },
              },
            ],
          },
          {
            label: {
              en: "Agriculture",
              ne: "अरू",
            },
            link: "/agriculture/",
            icon: "mdi:agriculture",
            id: "agriculture",
            items: [
              {
                label: "Agriculture",
                translations: {
                  en: "Agriculture",
                  ne: "कृषि",
                },
                autogenerate: { directory: "agriculture" },
              },
            ],
          },
          {
            label: {
              en: "Others",
              ne: "अरू",
            },
            link: "/others/",
            icon: "mdi:web",
            id: "others",
            items: [
              {
                label: "Others",
                translations: {
                  en: "Others",
                  ne: "अरू",
                },
                autogenerate: { directory: "others" },
              },
            ],
          },
        ]),
        starlightThemeRapide(),
        starlightGiscus({
          repo: "sankalpa-adhikari-sa/sankalpa-adhikari-sa.github.io",
          repoId: "R_kgDOPLnAbw",
          category: "comments",
          categoryId: "DIC_kwDOPLnAb84Cs5uT",
          theme: {
            light: "light_protanopia",
            dark: "dark_protanopia",
            auto: "preferred_color_scheme",
          },
        }),
      ],
    }),
    react(),
    markdoc(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
