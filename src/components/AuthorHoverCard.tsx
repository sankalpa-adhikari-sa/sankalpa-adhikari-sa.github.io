import { HoverCard, HoverCardTrigger, HoverCardContent } from "./hover-card";

interface AuthorCardProps {
  author: {
    name: string;
    url?: string | undefined;
    title?: string | undefined;
    picture?: ImageMetadata | undefined | string;
    bio?: string;
    socials?: {
      linkedin?: string;
      github?: string;
    };
  };
}
const AuthorHoverCard = ({ author }: AuthorCardProps) => {
  const defaultImage = import.meta.env.PUBLIC_DEFAULT_PROFILE_PICTURE;

  const pictureSrc =
    typeof author.picture === "string"
      ? author.picture
      : (author.picture?.src ?? defaultImage);
  return (
    <HoverCard>
      <HoverCardTrigger>
        <div className="flex items-center gap-3">
          <img
            src={pictureSrc}
            alt={author.name}
            width={700}
            height={1050}
            loading={"eager"}
            decoding={"async"}
            className="w-8 h-8 rounded-full object-cover"
          />
          {author.url ? (
            <a
              href={author.url}
              className="text-sm text-[var(--sl-color-white)] no-underline hover:underline"
              target="_blank"
              rel="noopener"
            >
              {author.name}
            </a>
          ) : (
            <span className="text-sm text-[var(--sl-color-white)]">
              {author.name}
            </span>
          )}
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="flex flex-col gap-2">
        <div className="flex flex-row gap-2 items-center">
          <img
            src={pictureSrc}
            alt={author.name}
            loading={"eager"}
            decoding={"async"}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <span>{author.name}</span>
            {author.title && (
              <span className="text-sm text-(--sl-color-gray-3)">
                {author.title}
              </span>
            )}
          </div>
        </div>
        {author.bio && <div className="text-sm">{author.bio}</div>}
        {author.socials && (
          <div className="flex flex-row items-center gap-2 text-sm">
            {author.socials.github && (
              <a
                className="text-(--sl-icon-color)"
                href={author.socials.github}
                target="_blank"
                rel="noopener"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57L9 21.07c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.09-.73.09-.73 1.2.09 1.83 1.24 1.83 1.24 1.08 1.83 2.81 1.3 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.63-5.48 5.92.42.36.81 1.1.81 2.22l-.01 3.29c0 .31.2.69.82.57A12 12 0 0 0 12 .3Z"></path>
                </svg>
              </a>
            )}
            {author.socials.linkedin && (
              <a
                className="text-(--sl-icon-color)"
                href={author.socials.linkedin}
                target="_blank"
                rel="noopener"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.47 2H3.53a1.45 1.45 0 0 0-1.47 1.43v17.14A1.45 1.45 0 0 0 3.53 22h16.94a1.45 1.45 0 0 0 1.47-1.43V3.43A1.45 1.45 0 0 0 20.47 2ZM8.09 18.74h-3v-9h3v9ZM6.59 8.48a1.56 1.56 0 0 1 0-3.12 1.57 1.57 0 1 1 0 3.12Zm12.32 10.26h-3v-4.83c0-1.21-.43-2-1.52-2A1.65 1.65 0 0 0 12.85 13a2 2 0 0 0-.1.73v5h-3v-9h3V11a3 3 0 0 1 2.71-1.5c2 0 3.45 1.29 3.45 4.06v5.18Z"></path>
                </svg>
              </a>
            )}
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
};
export default AuthorHoverCard;
