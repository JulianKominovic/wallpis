import db from "./db";

type WallpaperStats = {
  id: string;
  downloads: number;
};

function addDownload(wallpaperId: WallpaperStats["id"]): Promise<Error | true> {
  return new Promise((resolve, reject) =>
    db.run(
      "INSERT OR REPLACE INTO wallpapers (id, downloads) VALUES (?, COALESCE((SELECT downloads FROM wallpapers WHERE id = ?), 0) + 1)",
      [wallpaperId, wallpaperId],
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      }
    )
  );
}

function getAllWallpapers(): Promise<WallpaperStats[]> {
  return new Promise((resolve, reject) =>
    db.all<WallpaperStats>("SELECT * FROM wallpapers", (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    })
  );
}

const wallpapersStats = { addDownload, getAllWallpapers };

export default wallpapersStats;
