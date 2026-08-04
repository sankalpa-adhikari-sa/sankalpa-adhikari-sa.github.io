// @ts-check

import { satteri } from "@astrojs/markdown-satteri";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";
import expressiveCode from "astro-expressive-code";
import icon from "astro-icon";
import {
	mermaidColorReplacements,
	mermaidConfig,
	mermaidFontCss,
} from "@/config/mermaid.js";
import { pagefind } from "@/lib/pagefind-integration.mjs";
import { satteriMermaid } from "@/lib/satteri-mermaid.mjs";
import { satteriReadingTime } from "@/lib/satteri-reading-time.mjs";
import { satteriTreeBlock } from "@/lib/satteri-tree-block.mjs";
import { redirects } from '@/config/redirects.ts'

// https://astro.build/config
export default defineConfig({
	site: "https://sankalpa-adhikari-sa.github.io",
	integrations: [sitemap(), expressiveCode(), mdx(), icon(), pagefind()],
	vite: {
		plugins: [tailwindcss(), pluginLineNumbers()],
	},
	markdown: {
		processor: satteri({
			mdastPlugins: [satteriReadingTime(), satteriTreeBlock()],
			hastPlugins: [
				() =>
					satteriMermaid({
						mermaidConfig,
						colorReplacements: mermaidColorReplacements,
						css: mermaidFontCss,
					}),
			],
		}),
	},
	fonts: [
		{
			provider: fontProviders.local(),
			name: "Sometype",
			cssVariable: "--font-sometype",
			fallbacks: ["monospace"],
			options: {
				variants: [
					{
						src: ["./src/assets/fonts/Sometype-Mono.woff2"],
						weight: 400,
						style: "normal",
						display: "swap",
					},
				],
			},
		},
		{
			provider: fontProviders.local(),
			name: "SuisseBPIntl",
			cssVariable: "--font-suisse",
			fallbacks: ["sans-serif"],
			options: {
				variants: [
					{
						src: ["./src/assets/fonts/SuisseBPIntl-Light.woff2"],
						weight: 300,
						style: "normal",
						display: "swap",
					},
					{
						src: ["./src/assets/fonts/SuisseBPIntl-Regular.woff2"],
						weight: 400,
						style: "normal",
						display: "swap",
					},
					{
						src: ["./src/assets/fonts/SuisseBPIntl-Medium.woff2"],
						weight: 500,
						style: "normal",
						display: "swap",
					},
					{
						src: ["./src/assets/fonts/SuisseBPIntl-Bold.woff2"],
						weight: 700,
						style: "normal",
						display: "swap",
					},
				],
			},
		},
	],
	redirects
});
