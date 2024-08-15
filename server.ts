import { createServer } from "http";
import { parse } from "url";
import next from "next";
import wallpapersStats from "./database/wallpapers";
import db from "./database/db";

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    console.log(parsedUrl.pathname);
    if (parsedUrl.pathname?.startsWith("/wallpapers")) {
      console.log(
        "Downloaded wallpaper id",
        parsedUrl.pathname.split("/").pop()?.split(".")[0]!
      );
      wallpapersStats.addDownload(
        parsedUrl.pathname.split("/").pop()?.split(".")[0]!
      );
    }
    handle(req, res, parsedUrl);
  }).listen(port);
  server.once("close", () => {
    db.close();
  });
  console.log(
    `> Server listening at http://localhost:${port} as ${
      dev ? "development" : process.env.NODE_ENV
    }`
  );
});
