import { getCollection } from "astro:content";
import rss from "@astrojs/rss";
import { getConfig } from "@/config/config";
import { filterContentForListing } from "@/utils/content";

export async function GET(context) {
	const articles = filterContentForListing(await getCollection("articles"));

	articles.sort((b, a) => a.data.pubDate.valueOf() - b.data.pubDate.valueOf());

	const config = getConfig();

	return rss({
		title: `Articles - ${config.site.name}`,
		description: `Latest articles from ${config.site.name}`,
		site: context.site,
		items: articles.map((post) => ({
			...post.data,
			link: `/articles/${post.data.slug ?? post.id}/`,
		})),
	});
}
