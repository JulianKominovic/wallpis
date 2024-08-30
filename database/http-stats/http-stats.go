package httpstats_dao

import (
	"errors"
	"strings"

	"github.com/JulianKominovic/wallpis/database"
)

type HttpRequest struct {
	Id           int
	Datetime     string
	Method       string
	Url          string
	Headers      string
	Country      string
	City         string
	UserAgent    string
	Referer      string
	ResponseCode int
	ResponseSize int
	ResponseTime int
	Ip           string
}

type HttpRequestGroup struct {
	GroupBy string
	Count   int
}

func RegisterHttpTraffic(trafficRegister HttpRequest) error {
	q := "INSERT INTO stats (Datetime, Method, Url, Headers, Country, City, UserAgent, Referer, ResponseCode, ResponseSize, ResponseTime, Ip) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
	db := database.GetConnection()
	stmt, err := db.Prepare(q)
	if err != nil {
		return err
	}
	defer stmt.Close()
	r, err := stmt.Exec(
		trafficRegister.Datetime,
		trafficRegister.Method,
		trafficRegister.Url,
		trafficRegister.Headers,
		trafficRegister.Country,
		trafficRegister.City,
		trafficRegister.UserAgent,
		trafficRegister.Referer,
		trafficRegister.ResponseCode,
		trafficRegister.ResponseSize,
		trafficRegister.ResponseTime,
		trafficRegister.Ip,
	)
	if err != nil {
		return err
	}

	if i, err := r.RowsAffected(); err != nil || i != 1 {
		return errors.New("ERROR: Expected to affect only 1 row")
	}

	return nil
}
func GetStatsGroupBy(groupby string) ([]HttpRequestGroup, error) {
	var q string
	switch strings.ToLower(groupby) {
	case "method":
		q = "SELECT Method as GroupBy, COUNT(*) as Count FROM stats GROUP BY Method"
	case "url":
		q = "SELECT Url as GroupBy, COUNT(*) as Count FROM stats GROUP BY Url"
	case "country":
		q = "SELECT Country as GroupBy, COUNT(*) as Count FROM stats GROUP BY Country"
	case "city":
		q = "SELECT City as GroupBy, COUNT(*) as Count FROM stats GROUP BY City"
	case "useragent":
		q = "SELECT UserAgent as GroupBy, COUNT(*) as Count FROM stats GROUP BY UserAgent"
	case "referer":
		q = "SELECT Referer as GroupBy, COUNT(*) as Count FROM stats GROUP BY Referer"
	case "responsecode":
		q = "SELECT ResponseCode as GroupBy, COUNT(*) as Count FROM stats GROUP BY ResponseCode"
	case "responsesize":
		q = "SELECT ResponseSize as GroupBy, COUNT(*) as Count FROM stats GROUP BY ResponseSize"
	case "responsetime":
		q = "SELECT ResponseTime as GroupBy, COUNT(*) as Count FROM stats GROUP BY ResponseTime"
	default:
		return nil, errors.New("invalid groupby")
	}
	db := database.GetConnection()
	rows, err := db.Query(q, groupby, groupby, groupby)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var stats []HttpRequestGroup

	for rows.Next() {
		var stat HttpRequestGroup
		err = rows.Scan(&stat.GroupBy, &stat.Count)
		if err != nil {
			return nil, err
		}
		stats = append(stats, stat)
	}
	return stats, nil

}

func GetAll() ([]HttpRequest, error) {
	q := "SELECT * FROM stats"
	db := database.GetConnection()
	rows, err := db.Query(q)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var stats []HttpRequest
	for rows.Next() {
		var stat HttpRequest
		err = rows.Scan(&stat.Id, &stat.Datetime, &stat.Method, &stat.Url, &stat.Headers, &stat.Country, &stat.City, &stat.UserAgent, &stat.Referer, &stat.ResponseCode, &stat.ResponseSize, &stat.ResponseTime, &stat.Ip)
		if err != nil {
			return nil, err
		}
		stats = append(stats, stat)
	}
	return stats, nil
}
