import type { APIRoute } from "astro";
import wallpapersStats from "../../../database/wallpapers";

export const GET: APIRoute = async ({ params, request }) => {
  const encoder = new TextEncoder();
  // Create a streaming response
  let dispachFn: (...args: any) => void;
  const customReadable = new ReadableStream({
    start(controller) {
      dispachFn = (updates) => {
        console.log("[SSE Downloads] Downloaded wallpaper id", updates);
        controller.enqueue(encoder.encode(`data: ${updates}\n\n`));
      };
      wallpapersStats.emitter.downloads.on("download", dispachFn);
      controller.enqueue(encoder.encode("data: connected\n\n"));
    },
    cancel() {
      console.log("[SSE Downloads] Disconnected");
      wallpapersStats.emitter.downloads.removeListener("download", dispachFn);
    },
  });
  // Return the stream response and keep the connection alive
  return new Response(customReadable, {
    // Set the headers for Server-Sent Events (SSE)
    headers: {
      Connection: "keep-alive",
      "Content-Encoding": "none",
      "Cache-Control": "no-cache, no-transform",
      "Content-Type": "text/event-stream; charset=utf-8",
    },
  });
};
