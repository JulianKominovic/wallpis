import db from "./db";

type WallpaperStats = {
  id: string;
  downloads: number;
};

function addDownload(wallpaperId: WallpaperStats["id"]): Promise<Error | true> {
  return new Promise((resolve, reject) =>
    db.run(
      "INSERT INTO wallpapers (id, downloads) VALUES (?, 0) ON DUPLICATE KEY UPDATE wallpapers SET downloads = downloads+1 WHERE id=?",
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

const wallpapersStats = { addDownload };

export default wallpapersStats;
