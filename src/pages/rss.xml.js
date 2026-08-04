import { getCollection } from "astro:content";
import rss from "@astrojs/rss";
import { getConfig } from "@/config/config";
import { filterContentForListing } from "@/utils/content";

export async function GET(context) {
	const articles = filterContentForListing(await getCollection("articles")).map(
		(post) => ({
			...post,
		}),
	);
	const projects = filterContentForListing(await getCollection("projects")).map(
		(post) => ({
			...post,
		}),
	);
	const all = articles.concat(projects);
	all.sort((b, a) => a.data.pubDate.valueOf() - b.data.pubDate.valueOf());

	const config = getConfig();
	return rss({
		title: `All Posts- ${config.site.name}`,
		description: config.descriptions.site,
		site: context.site,
		items: all.map((post) => ({
			...post.data,
			link:
				post.collection === "projects"
					? `/projects/${post.data.slug ?? post.id}/`
					: `/articles/${post.data.slug ?? post.id}/`,
		})),
	});
}
