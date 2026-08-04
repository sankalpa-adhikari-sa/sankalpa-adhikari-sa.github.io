/**
 * MDX component remapping configuration
 *
 * These components are automatically used when rendering MDX content.
 * They provide enhanced functionality over standard HTML elements:
 * - <a> -> SmartLink: Auto-detects internal/external links, adds icons
 *
 * To extend, add more mappings to this object (e.g., code: CustomCode).
 * Components must accept standard HTML element props.
 */
import { FileTree } from "@/components/mdx";
import SmartLink from "@/components/mdx/SmartLink.astro";

export const MDX_COMPONENT_REMAPPING = {
	a: SmartLink,
	"file-tree": FileTree,
} as const;
