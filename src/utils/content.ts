/**
 * Content Filtering Utilities
 *
 * Centralized filtering logic for draft content.
 * Used across RSS feeds, individual pages, and listing pages.
 */

/**
 * Filter content for individual pages
 *
 * In production: excludes drafts
 * In development: includes everything
 *
 */
export function filterContentForPage<
	T extends { id: string; data: { draft?: boolean } },
>(entries: T[], isProduction: boolean = import.meta.env.PROD): T[] {
	return isProduction
		? entries.filter((entry) => entry.data.draft !== true)
		: entries;
}

/**
 * Filter content for listing pages (indexes, RSS feeds, etc.)
 *
 * In production: excludes drafts pages
 * In development: includes drafts
 *
 */
export function filterContentForListing<
	T extends {
		id: string;
		data: { draft?: boolean; title: string; pubDate: Date };
	},
>(entries: T[], isProduction: boolean = import.meta.env.PROD): T[] {
	const draftFilter = (entry: T) =>
		isProduction ? entry.data.draft !== true : true;
	return entries
		.filter((entry) => draftFilter(entry))
		.sort((a, b) => {
			const byDate = a.data.pubDate.valueOf() - b.data.pubDate.valueOf();
			return byDate !== 0 ? byDate : a.data.title.localeCompare(b.data.title);
		});
}
