import type { CollectionEntry } from "astro:content";

export function filterDocs({
  docs,
  lang,
  limit,
  sort_by = "date",
}: {
  docs: CollectionEntry<"docs">[];
  lang: string;
  limit?: number;
  sort_by: "alphabitical" | "date";
}) {
  const now = new Date();

  const filteredDocs = docs.filter((doc) => {
    const docLang = doc.id.split("/")[0];
    const created = doc.data.created;

    if (!created) return false;

    const createdDate = created instanceof Date ? created : new Date(created);
    if (isNaN(createdDate.getTime()) || createdDate > now) return false;

    return (
      docLang === lang &&
      !doc.data.draft &&
      doc.data.glob &&
      doc.data.template === "doc"
    );
  });

  const sortedDocs = filteredDocs.sort((a, b) => {
    if (sort_by === "alphabitical") {
      return a.data.title.localeCompare(b.data.title);
    } else {
      const aDate =
        a.data.created instanceof Date
          ? a.data.created
          : new Date(a.data.created!);
      const bDate =
        b.data.created instanceof Date
          ? b.data.created
          : new Date(b.data.created!);
      return bDate.getTime() - aDate.getTime();
    }
  });

  const limitedDocs = limit ? sortedDocs.slice(0, limit) : sortedDocs;

  return limitedDocs.map((doc) => ({
    id: doc.id,
    data: {
      title: doc.data.title,
      subtitle: doc.data.subtitle,
      description: doc.data.description,
      tags: doc.data.tags,
      authors: doc.data.authors,
      created: doc.data.created,
      lastUpdated: doc.data.lastUpdated,
      coverImage: doc.data.coverImage,
      coverImageAlt: doc.data.coverImageAlt,
    },
  }));
}
