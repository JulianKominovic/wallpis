package wallpapers_dao

import (
	"errors"

	"github.com/JulianKominovic/wallpis/database"
)

type WallpaperSchema struct {
	ID        string
	Downloads int
}

func AddDownload(wallpaperId string) error {
	q := "INSERT OR REPLACE INTO wallpapers (ID, Downloads) VALUES (?, COALESCE((SELECT Downloads FROM wallpapers WHERE ID = ?), 0) + 1)"
	db := database.GetConnection()
	stmt, err := db.Prepare(q)
	if err != nil {
		return err
	}
	defer stmt.Close()
	r, err := stmt.Exec(wallpaperId, wallpaperId)
	if err != nil {
		return err
	}

	if i, err := r.RowsAffected(); err != nil || i != 1 {
		return errors.New("ERROR: Expected to affect only 1 row")
	}

	return nil

}

func GetAll() ([]WallpaperSchema, error) {
	q := "SELECT * FROM wallpapers ORDER BY Downloads DESC"
	db := database.GetConnection()
	rows, err := db.Query(q)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var wallpapers []WallpaperSchema
	for rows.Next() {
		var wallpaper WallpaperSchema
		err = rows.Scan(&wallpaper.ID, &wallpaper.Downloads)
		if err != nil {
			return nil, err
		}
		wallpapers = append(wallpapers, wallpaper)
	}
	return wallpapers, nil
}
