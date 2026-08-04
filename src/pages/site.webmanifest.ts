import type { APIRoute } from "astro";
import { getConfig } from "@/config/config";

export const GET: APIRoute = () => {
	const config = getConfig();

	const manifest = {
		name: config.site.name,
		short_name: config.site.shortName,
		description: config.descriptions.short,
		start_url: "/",
		display: "browser",
		background_color: config.site.themeColor,
		theme_color: config.site.themeColor,
		icons: [
			{
				src: "/favicon.svg",
				sizes: "any",
				type: "image/svg+xml",
			},
			{
				src: "/favicon.png",
				sizes: "2400x2400",
				type: "image/png",
				purpose: "any",
			},
			{
				src: "/android-chrome-192x192.png",
				sizes: "192x192",
				type: "image/png",
			},
			{
				src: "/android-chrome-512x512.png",
				sizes: "512x512",
				type: "image/png",
			},
		],
	};

	return new Response(JSON.stringify(manifest, null, 2), {
		headers: {
			"Content-Type": "application/manifest+json",
		},
	});
};
