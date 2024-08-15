import fs from "fs/promises";
export let WALLPAPERS_COUNT = 0;
export let WALLPAPERS_INDEX: WallpaperFolder = null!;

type WallpaperFolder = {
  anime: {
    "dark-skies": string[];
    "reddish-outerspace": string[];
    "snowy-mountains": string[];
    waterfalls: string[];
    "villages-noontime": string[];
    "villages-sunset": string[];
  };
  "cute-things": {
    keyboards: string[];
  };
};
export async function initWallpapers() {
  if (WALLPAPERS_INDEX) return;
  const categories = await fs.readdir("./public/sd-wallpapers");
  WALLPAPERS_INDEX = {
    anime: {
      "dark-skies": [],
      "reddish-outerspace": [],
      "snowy-mountains": [],
      waterfalls: [],
      "villages-noontime": [],
      "villages-sunset": [],
    },
    "cute-things": {
      keyboards: [],
    },
  };
  await Promise.all(
    categories.map(async (category) => {
      const files = await fs.readdir(`./public/sd-wallpapers/${category}`);
      return await Promise.all(
        files.map(async (subcategory) => {
          const files = await fs.readdir(
            `./public/sd-wallpapers/${category}/${subcategory}`
          );
          files.forEach((f) => {
            // @ts-ignore
            WALLPAPERS_INDEX[category][subcategory].push(
              `/sd-wallpapers/${category}/${subcategory}/${f}`
            );
            WALLPAPERS_COUNT++;
          });
        })
      );
    })
  );
}

await initWallpapers();
