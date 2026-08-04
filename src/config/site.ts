/**
 * Site Configuration (Raw Data)
 *
 * Edit this file to update site metadata.
 * Consuming code should use getConfig() from @/config/config.
 */

export const CONFIG = {
	// Site Identity
	site: {
		name: "Sankalpa Adhikari",
		shortName: "sankalpa.adhikari",
		url: "https://sankalpa-adhikari-sa.github.io",
		locale: "ne_NP",
		themeColor: "#1a1a1a",
	},
	// Pagination
	pagination: {
		pageSize: 20,
	},

	// Author Identity
	author: {
		givenName: "Sankalpa",
		familyName: "Adhikari",
		email: "sankalpa.adhikari.sa@gmail.com",
		contactEmail: "hi+sankalpa.adhikari.sa@gmail.com", // For mailto links (tracking suffix)
		location: "Kathmandu, Nepal",
		jobTitle: "Remote Work Consultant",
		extendedTitle: "",
		twitter: "",
		avatar: "/favicon.png",
		avatarCircle: "/favicon.png",
	},

	// Descriptions for different contexts
	descriptions: {
		short: "Remote work consultant and agricultural engineer.",
		site: "Remote work consultant and agricultural engineer.",
		author: "Remote work consultant and agricultural engineer.",
		organization: "",
		// Used as the AI summary at the top of llms.txt
		aiSummary:
			"Sankalpa Adhikari is a remote work consultant based in Nepal. This is his personal website where he shares articles and notes on remote work, leadership, and technology.",
	},

	// Page title templates ({title} replaced at runtime)
	pageTitleTemplates: {
		article: "{title} | Articles by Sankalpa Adhikari",
		page: "{title} | Sankalpa Adhikari",
		default: "{title} | Sankalpa Adhikari",
	},

	// Default descriptions for index pages
	pageDescriptions: {
		articles: "",
	},

	// Social profiles (used by SocialLinks, llms.txt, schema.org sameAs)
	socialProfiles: [
		{
			id: "linkedin",
			name: "LinkedIn",
			url: "www.linkedin.com/in/sankalpa-adhikari-sa",
			icon: "social/linkedin",
			showInFooter: true,
		},
		{
			id: "github",
			name: "GitHub",
			url: "https://github.com/sankalpa-adhikari-sa",
			icon: "social/github",
			showInFooter: true,
		},
		{
			id: "instagram",
			name: "Instagram",
			url: "https://www.instagram.com/sankalpa.adhikari.sa/",
			icon: "social/instagram",
			showInFooter: true,
		},
	],

	// External links (for llms.txt, etc.)
	externalLinks: [
		{
			id: "orgnizations",
			name: "NSAE",
			url: "https://www.nsae.org.np",
			description: "Member of Nepalese society of Agricultural Engineers",
		},
	],

	organization: {
		name: "Sankalpa Adhikari",
	},
} as const;
