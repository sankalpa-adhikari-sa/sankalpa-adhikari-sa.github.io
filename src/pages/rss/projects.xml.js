import { getCollection } from "astro:content";
import rss from "@astrojs/rss";
import { getConfig } from "@/config/config";
import { filterContentForListing } from "@/utils/content";

export async function GET(context) {
	const projects = filterContentForListing(await getCollection("projects"));

	projects.sort((b, a) => a.data.pubDate.valueOf() - b.data.pubDate.valueOf());

	const config = getConfig();

	return rss({
		title: `Projects - ${config.site.name}`,
		description: `Latest projects from ${config.site.name}`,
		site: context.site,
		items: projects.map((post) => ({
			...post.data,
			link: `/projects/${post.data.slug ?? post.id}/`,
		})),
	});
}
