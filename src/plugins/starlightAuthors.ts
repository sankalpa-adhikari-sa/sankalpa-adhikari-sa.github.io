import type { StarlightPlugin } from "@astrojs/starlight/types";
import type { StarlightAuthorsConfig } from "./config/authorsConfig";

let globalAuthorsConfig: StarlightAuthorsConfig = {};

export default function starlightAuthors(
  authorsConfig: StarlightAuthorsConfig
): StarlightPlugin {
  globalAuthorsConfig = authorsConfig;

  return {
    name: "starlight-authors",
    hooks: {
      setup: ({ addIntegration, config, logger }) => {
        if (!authorsConfig.authors) {
          logger.warn("No authors configuration provided");
        }

        addIntegration({
          name: "starlight-authors-config",
          hooks: {
            "astro:config:setup": ({ updateConfig }) => {
              updateConfig({
                vite: {
                  define: {
                    __STARLIGHT_AUTHORS__: JSON.stringify(
                      authorsConfig.authors || {}
                    ),
                  },
                },
              });
            },
          },
        });
      },
    },
  };
}
