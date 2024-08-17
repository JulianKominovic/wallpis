import type { APIContext, MiddlewareNext } from "astro";
import wallpapersStats from "./database/wallpapers";

export function onRequest(context: APIContext, next: MiddlewareNext) {
  const pathname = context.url.pathname;
  if (pathname.startsWith("/api/download/")) {
    if (
      wallpapersStats.addDownload(
        pathname.split("/").pop()?.split(".")[0] as string
      ) < 0
    ) {
      return new Response("Not Found", { status: 404 });
    }
    context.url.pathname = pathname
      .replace("/api/download", "/wallpapers")
      .replace(".avif", ".png");

    return Response.redirect(context.url, 301);
  }

  return next();
}
