import type { MarkdownHeading } from "astro";

export interface TocHeading extends MarkdownHeading {
	children: TocHeading[];
}

export interface BuildTocOptions {
	/** Shallowest heading depth to include (default: 2, i.e. h2). */
	minLevel?: number;
	/** Deepest heading depth to include (default: 3, i.e. h3). */
	maxLevel?: number;
}

/**
 * Turns Astro's flat `MarkdownHeading[]` into a nested tree, respecting
 * arbitrary heading depths (not just h2/h3) via a parent stack. A heading
 * becomes the child of the closest preceding heading with a smaller depth;
 * anything shallower than `minLevel` or deeper than `maxLevel` is skipped
 * entirely (its children re-parent to the next eligible ancestor).
 */
export function buildToc(
	headings: MarkdownHeading[],
	{ minLevel = 1, maxLevel = 3 }: BuildTocOptions = {},
): TocHeading[] {
	const toc: TocHeading[] = [];
	// Stack of ancestors currently "open", shallowest first.
	const parents: TocHeading[] = [];

	for (const heading of headings) {
		if (heading.depth < minLevel || heading.depth > maxLevel) continue;

		const node: TocHeading = { ...heading, children: [] };

		// Pop any ancestor that isn't actually shallower than this heading.
		while (
			parents.length > 0 &&
			parents[parents.length - 1]!.depth >= node.depth
		) {
			parents.pop();
		}

		const parent = parents[parents.length - 1];
		if (parent) {
			parent.children.push(node);
		} else {
			toc.push(node);
		}

		parents.push(node);
	}

	return toc;
}
