/**
 *
 * Steps:
 * 1. New images will be in labs/new-wallpapers
 * 2. List all files there
 * 3. Create a lossless version of the images
 * 4. Output them in public/wallpapers/<category>/<subcategory>/<name>.png
 * 5. Create a lossy version of the images (sd version)
 * 6. Output them in public/sd-wallpapers/<category>/<subcategory>/<name>.avif
 * 7. Create a meta.json file with the metadata (category, subcategory, main-color) in public/wallpapers/<category>/<subcategory>/meta.json
 *
 *
 */

const sharp = require("sharp");
const fs = require("fs/promises");
const path = require("path");
const os = require("os");
const assert = require("assert");
const fsSync = require("fs");

const sourceFolder = "labs/new-wallpapers";
const category = process.argv[2];
const subcategory = process.argv[3];
const color = process.argv[4];
const cores = os.cpus().length / 2;
const percentage = 25;

assert(category, "Category is required, pass it as the first argument");
assert(subcategory, "Subcategory is required, pass it as the second argument");
assert(color, "Color is required, pass it as the third argument");

const kebabCase = (string = "") => {
  return string.replace(/\s+/g, "-").toLowerCase();
};
const UhdDestinationFolder = path.join(
  "public",
  "wallpapers",
  kebabCase(category),
  kebabCase(subcategory)
);
const SdDestinationFolder = path.join(
  "public",
  "sd-wallpapers",
  kebabCase(category),
  kebabCase(subcategory)
);

if (!fsSync.existsSync(sourceFolder))
  fsSync.mkdirSync(sourceFolder, { recursive: true });

if (!fsSync.existsSync(UhdDestinationFolder))
  fsSync.mkdirSync(UhdDestinationFolder, { recursive: true });

if (!fsSync.existsSync(SdDestinationFolder))
  fsSync.mkdirSync(SdDestinationFolder, { recursive: true });

async function prepareImages(files = []) {
  for (const file of files) {
    console.log("Compressing ", file, " lossless");
    const sharpInstance = sharp(path.join(sourceFolder, file));
    const info = await sharpInstance.metadata();
    const width = Math.round((info.width * percentage) / 100);
    const height = Math.round((info.height * percentage) / 100);
    await sharpInstance
      .png({
        effort: 10,
        quality: 100,
        palette: true,
        progressive: true,
        compressionLevel: 9,
      })
      .toFile(path.join(UhdDestinationFolder, file));
    console.log("Compressing ", file, " lossy sd version");
    await sharpInstance
      .resize(width, height)
      .avif({ quality: 80 })
      .toFile(path.join(SdDestinationFolder, file.replace(".png", ".avif")));
  }
}

const files = fsSync
  .readdirSync(sourceFolder)
  .filter((f) => f.endsWith(".png"));
assert(
  files.length > 0,
  "No files found to compress, please add some .png files to the source folder: " +
    sourceFolder
);
const chunksLen = Math.ceil(files.length / cores);
const chunks = [];
console.log("Files", files.length);

async function go() {
  for (let i = 0; i < files.length; i += chunksLen) {
    console.log("Chunk", i, "to", i + chunksLen);
    chunks.push(files.slice(i, i + chunksLen));
  }
  await Promise.all(chunks.map((chunk) => prepareImages(chunk)));
  await fs.writeFile(
    path.join(UhdDestinationFolder, "meta.json"),
    JSON.stringify({ category, subcategory, color }, null, 2)
  );
}

go();
