const sharp = require("sharp");
const fs = require("fs/promises");
const fsSync = require("fs");
const os = require("os");
const assert = require("assert");
const path = require("path");

const cores = os.cpus().length;

const sourceFolder = "labs/wallpapers-to-be-compressed";
const destinationFolder = "labs/compressed-wallpapers";

if (!fsSync.existsSync(sourceFolder))
  fsSync.mkdirSync(sourceFolder, { recursive: true });
if (!fsSync.existsSync(destinationFolder))
  fsSync.mkdirSync(destinationFolder, { recursive: true });

async function compress(files = []) {
  for (const file of files) {
    console.log("Compressing ", file, " lossless");
    const sharpInstance = sharp(path.join(sourceFolder, file));
    await sharpInstance
      .png({
        effort: 10,
        quality: 100,
        palette: true,
        progressive: true,
        compressionLevel: 9,
      })
      .toFile(path.join(destinationFolder, file));
  }
}

async function go() {
  const files = (await fs.readdir(sourceFolder)).filter((f) =>
    f.endsWith(".png")
  );
  assert(
    files.length > 0,
    "No files found to compress, please add some .png files to the source folder: " +
      sourceFolder
  );
  const chunksLen = Math.ceil(files.length / cores);
  const chunks = [];
  console.log("Files", files.length);
  for (let i = 0; i < files.length; i += chunksLen) {
    console.log("Chunk", i, "to", i + chunksLen);
    chunks.push(files.slice(i, i + chunksLen));
  }

  await Promise.all(chunks.map((chunk) => compress(chunk)));
}

go();
