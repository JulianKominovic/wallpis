const sharp = require("sharp");
const fs = require("fs/promises");
const path = require("path");
const os = require("os");
async function walk(dir) {
  let files = await fs.readdir(dir);
  files = await Promise.all(
    files.map(async (file) => {
      const filePath = path.join(dir, file);
      const stats = await fs.stat(filePath);
      if (stats.isDirectory()) return walk(filePath);
      else if (stats.isFile()) return filePath;
    })
  );

  return files.reduce((all, folderContents) => all.concat(folderContents), []);
}

const cores = os.cpus().length;

async function compress(files = []) {
  for (const file of files) {
    console.log("Compressing ", file, " lossless");
    const sharpInstance = sharp(file);
    console.log("file");
    await fs.mkdir(path.dirname(file.replace("/wallpapers/", "/compressed/")), {
      recursive: true,
    });
    await sharpInstance
      .png({ quality: 100, progressive: true, compressionLevel: 9 })
      .toFile(file.replace("/wallpapers/", "/compressed/"));
  }
}

async function go() {
  const files = (await walk("public/wallpapers")).filter((f) =>
    f.endsWith(".png")
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
