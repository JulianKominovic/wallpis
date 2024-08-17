import Database from "better-sqlite3";

const db = new Database("./wallpapers.sqlite", {
  verbose: console.log,
});
console.log("Database connected");

export function init() {
  db.prepare(
    "CREATE TABLE IF NOT EXISTS wallpapers (id TEXT PRIMARY KEY, downloads INTEGER)"
  ).run();
}
init();

export default db;
