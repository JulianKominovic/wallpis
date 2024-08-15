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

const cores = os.cpus().length / 2;
const percentage = 25;

async function compress(files = []) {
  for (const file of files) {
    console.log("Compressing ", file, "to", file.replace(".png", ".avif"));
    const sharpInstance = sharp(file);
    const info = await sharpInstance.metadata();
    const width = Math.round((info.width * percentage) / 100);
    const height = Math.round((info.height * percentage) / 100);

    sharpInstance
      .resize(width, height)
      .avif({ quality: 60 })
      .toFile(file.replace(".png", ".avif"));
    await fs.rm(file, { force: true }).catch(console.error);
  }
}

async function go() {
  await fs.rm("public/sd-wallpapers", { recursive: true, force: true });
  await fs.cp("public/wallpapers", "public/sd-wallpapers", {
    recursive: true,
    force: true,
  });
  const files = (await walk("public/sd-wallpapers")).filter((f) =>
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
