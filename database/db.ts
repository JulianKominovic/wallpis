import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./db");

db.run(
  "CREATE IF NOT EXISTS TABLE wallpapers (id TEXT PRIMARY KEY, downloads INTEGER)",
  (err) => {
    console.log(err);
  }
);

export default db;
