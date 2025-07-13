import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  const locales = ["en", "ne"];

  const isLocalized = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  const isStaticAsset = pathname.includes(".");
  const isRoot = pathname === "/";

  // Exclude internal Astro paths like /_image, /_astro, etc.
  const isInternalAstroPath = pathname.startsWith("/_");

  if (!isLocalized && !isStaticAsset && !isRoot && !isInternalAstroPath) {
    return context.redirect(`/en${pathname}`, 302);
  }

  return next();
});
