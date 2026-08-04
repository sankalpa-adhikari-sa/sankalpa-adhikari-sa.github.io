import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { getConfig } from "@/config/config";
import { filterContentForListing } from "@/utils/content";

// =============================================================================
// CUSTOMIZABLE CONTENT
// Update these sections as needed. The rest is auto-generated.
// =============================================================================

const config = getConfig();

const ABOUT_CONTENT = ``;

// Pages to exclude from "Other Pages" (matched against URL path)
const EXCLUDED_PAGES = ["/404/"];

// =============================================================================
// PAGE DISCOVERY
// Auto-discovers static pages from src/pages/, excluding dynamic routes and partials
// =============================================================================

function discoverStaticPages(): Array<{ path: string; title: string }> {
	// Glob all .astro/.mdx page files (eager: false since we only need paths)
	const pageFiles = import.meta.glob("./**/*.{astro,mdx}", { eager: false });

	return Object.keys(pageFiles)
		.filter((file) => {
			// Exclude dynamic routes (contain [...])
			if (file.includes("[")) return false;
			// Exclude partials (start with _)
			if (file.includes("/_")) return false;
			// Exclude the homepage
			if (file === "./index.astro") return false;
			return true;
		})
		.map((file) => {
			// Convert file path to URL path: ./foo/index.astro -> /foo/
			const path =
				"/" +
				file
					.replace(/^\.\//, "") // Remove leading ./
					.replace(/\/index\.(astro|mdx)$/, "/") // /foo/index.astro -> /foo/
					.replace(/\.(astro|mdx)$/, "/"); // /foo.mdx -> /foo/

			// Derive title from path: /foo-bar/ -> Foo Bar, /about/team/ -> About Team
			const title = path
				.replace(/^\/|\/$/g, "") // Remove leading/trailing slashes
				.split(/[-/]/) // Split on both hyphens and slashes
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" ");

			return { path, title };
		})
		.filter(
			({ path }) =>
				!EXCLUDED_PAGES.includes(path) && !path.startsWith("/styleguide"),
		)
		.sort((a, b) => a.title.localeCompare(b.title));
}

// =============================================================================
// GENERATION LOGIC
// =============================================================================

export const GET: APIRoute = async () => {
	const articles = filterContentForListing(
		await getCollection("articles"),
	) as CollectionEntry<"articles">[];
	articles.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
	
	const projects = filterContentForListing(
		await getCollection("projects"),
	) as CollectionEntry<"projects">[];
	projects.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

	const works = filterContentForListing(
		await getCollection("work"),
	) as CollectionEntry<"work">[];
	works.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

	const lines: string[] = [];

	// Title
	lines.push(`# ${config.site.name}`);
	lines.push("");

	// AI Summary
	lines.push(`> ${config.descriptions.aiSummary}`);
	lines.push("");

	// About
	lines.push(ABOUT_CONTENT);
	lines.push("");

	// External links
	lines.push("## Links");
	lines.push("");
	lines.push(`- [Website](${config.site.url})`);
	lines.push(`- [Avatar](${config.author.avatarUrl})`);
	lines.push(`- [Email](mailto:${config.author.email})`);
	for (const profile of config.socialProfiles) {
		lines.push(`- [${profile.name}](${profile.url})`);
	}
	lines.push("");

	// Articles
	lines.push("## Articles");
	lines.push("");
	for (const article of articles) {
		// Link to the .md variant so agents fetch markdown directly (afdocs
		// llms-txt-links-markdown). Every listed article has a .md route: llms.txt
		// uses filterContentForListing (no drafts, no styleguide), a subset of the
		// .md routes' filterContentForPage (no drafts).
		const url = `${config.site.url}/articles/${article.data.slug ?? article.id}.md`;
		const description = article.data.description
			? `: ${article.data.description}`
			: "";
		lines.push(`- [${article.data.title}](${url})${description}`);
	}
	lines.push("");

	// Projects
	lines.push("## Projects");
	lines.push("");
	for (const project of projects) {
		// Link to the .md variant so agents fetch markdown directly (afdocs
		// llms-txt-links-markdown). Every listed project has a .md route: llms.txt
		// uses filterContentForListing (no drafts, no styleguide), a subset of the
		// .md routes' filterContentForPage (no drafts).
		const url = `${config.site.url}/projects/${project.data.slug ?? project.id}.md`;
		const description = project.data.description
			? `: ${project.data.description}`
			: "";
		lines.push(`- [${project.data.title}](${url})${description}`);
	}
	lines.push("");

	// Work
	lines.push("## Work");
	lines.push("");
	for (const work of works) {
		// Link to the .md variant so agents fetch markdown directly (afdocs
		// llms-txt-links-markdown). Every listed work has a .md route: llms.txt
		// uses filterContentForListing (no drafts, no styleguide), a subset of the
		// .md routes' filterContentForPage (no drafts).
		const url = `${config.site.url}/work/${work.data.slug ?? work.id}.md`;
		const description = work.data.description
			? `: ${work.data.description}`
			: "";
		lines.push(`- [${work.data.title}](${url})${description}`);
	}
	lines.push("");

	// Other pages (auto-discovered)
	const staticPages = discoverStaticPages();
	lines.push("## Other Pages");
	lines.push("");
	for (const page of staticPages) {
		lines.push(`- [${page.title}](${config.site.url}${page.path})`);
	}
	lines.push("");

	// External links from config
	if (config.externalLinks.length > 0) {
		lines.push("## External");
		lines.push("");
		for (const link of config.externalLinks) {
			const desc = link.description ? `: ${link.description}` : "";
			lines.push(`- [${link.name}](${link.url})${desc}`);
		}
	}

	const content = lines.join("\n");

	return new Response(content, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
		},
	});
};
