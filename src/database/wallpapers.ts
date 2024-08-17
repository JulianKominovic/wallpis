import EventEmitter from "events";
import db from "./db";

type WallpaperStats = {
  id: string;
  downloads: number;
};

const downloadsEmitter = new EventEmitter();

function addDownload(wallpaperId: WallpaperStats["id"]): number {
  let result: number = -1;
  db.transaction(() => {
    result = db
      .prepare(
        "INSERT OR REPLACE INTO wallpapers (id, downloads) VALUES (?, COALESCE((SELECT downloads FROM wallpapers WHERE id = ?), 0) + 1)"
      )
      .run(wallpaperId, wallpaperId).changes;
  }).immediate();
  console.log("[Database] Downloaded wallpaper id", wallpaperId);
  if (result > 0) downloadsEmitter.emit("download", wallpaperId);
  return result;
}

function getAllWallpapers(): WallpaperStats[] {
  return db.prepare("SELECT * FROM wallpapers").all() as WallpaperStats[];
}

const wallpapersStats = {
  addDownload,
  getAllWallpapers,
  emitter: {
    downloads: downloadsEmitter,
  },
};

export default wallpapersStats;
