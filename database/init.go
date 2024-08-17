package database

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/mattn/go-sqlite3"
	"github.com/oschwald/geoip2-golang"
)

var db *sql.DB
var geoIPDatabase *geoip2.Reader

func GetGeoIP() *geoip2.Reader {
	if geoIPDatabase != nil {
		return geoIPDatabase
	}
	db, err := geoip2.Open("geolite2/GeoLite2-City.mmdb")
	if err != nil {
		log.Fatal(err)
		panic(err)
	}
	geoIPDatabase = db
	return geoIPDatabase
}

func createTables(dbInstance *sql.DB) {
	_, err := dbInstance.Exec(`CREATE TABLE IF NOT EXISTS wallpapers (id TEXT PRIMARY KEY, downloads INTEGER)`)
	if err != nil {
		panic(err)
	}
}

func GetConnection() *sql.DB {
	if db != nil {
		return db
	}
	_, fsStatError := os.Stat("data.sqlite")
	if os.IsNotExist((fsStatError)) {
		fsError := os.WriteFile("data.sqlite", []byte{}, 0644)
		if fsError != nil {
			panic(fsError)
		}
	}

	var err error
	db, err = sql.Open("sqlite3", "data.sqlite")
	if err != nil {
		panic(err)
	}
	createTables(db)
	return db
}
