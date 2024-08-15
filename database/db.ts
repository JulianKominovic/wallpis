import sqlite3 from "sqlite3";
sqlite3.verbose();
const db = new sqlite3.Database("./database/wallpapers.sqlite");
console.log("Database connected");

export function init() {
  db.run(
    "CREATE TABLE IF NOT EXISTS wallpapers (id TEXT PRIMARY KEY, downloads INTEGER)"
  );
}

export default db;
