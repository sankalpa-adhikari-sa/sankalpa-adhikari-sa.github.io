import type {
  AuthorReference,
  BlogAuthor,
} from "../plugins/config/authorsConfig";

export function resolveAuthors(
  authorReferences: AuthorReference[],
  authorsConfig: Record<string, BlogAuthor>
): BlogAuthor[] {
  return authorReferences.map((author) => {
    if (typeof author === "string") {
      const configAuthor = authorsConfig[author];
      if (!configAuthor) {
        console.warn(`Author "${author}" not found in configuration`);
        return { name: author };
      }
      return configAuthor;
    } else {
      return author;
    }
  });
}
