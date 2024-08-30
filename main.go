package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io/fs"
	"log"
	"net"
	"os"
	"strings"
	"time"

	"github.com/JulianKominovic/wallpis/database"
	httpstats_dao "github.com/JulianKominovic/wallpis/database/http-stats"
	wallpapers_dao "github.com/JulianKominovic/wallpis/database/wallpapers"
	telegram_integration "github.com/JulianKominovic/wallpis/integrations"
	"github.com/JulianKominovic/wallpis/utils"
	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/etag"
	"github.com/gofiber/fiber/v3/middleware/helmet"
	"github.com/gofiber/fiber/v3/middleware/limiter"
	"github.com/gofiber/fiber/v3/middleware/static"
	"github.com/gofiber/template/mustache/v2"
	"github.com/kataras/go-events"
	"github.com/valyala/fasthttp"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
)

type WallpaperCategory struct {
	Name          string
	Subcategories []WallpaperSubcategory
}

type WallpaperSubcategory struct {
	Name                 string
	Meta                 Meta
	Wallpapers           []Wallpaper
	BackgroundCoverImage string
}

type Meta struct {
	Color string
}
type Wallpaper struct {
	Path   string
	SDPath string
}

type WallpaperDownloadEvent struct {
	Country   string
	FlagEmoji string
	City      string
	Url       string
}

func LoadWallpapers() []WallpaperCategory {
	var wallpaperCategories []WallpaperCategory
	root := os.DirFS("./public")
	var categories, err = fs.ReadDir(root, "wallpapers")
	if err != nil {
		fmt.Printf("Error: %s", err.Error())
	}
	for _, category := range categories {
		var subcategories, err = fs.ReadDir(root, "wallpapers/"+category.Name())
		if err != nil {
			fmt.Printf("Error: %s", err.Error())
		}
		var wallpapers []WallpaperSubcategory
		for _, subcategory := range subcategories {
			var wallpaperNames, err = fs.ReadDir(root, "wallpapers/"+category.Name()+"/"+subcategory.Name())
			if err != nil {
				fmt.Printf("Error: %s", err.Error())
			}
			var wallpaperList []Wallpaper
			var meta Meta
			var metadata, fsreadErr = fs.ReadFile(root, "wallpapers/"+category.Name()+"/"+subcategory.Name()+"/meta.json")
			if fsreadErr != nil {
				fmt.Printf("Error: %s", err.Error())
			}
			jsonError := json.Unmarshal(metadata, &meta)
			if jsonError != nil {
				fmt.Printf("Error: %s", jsonError.Error())
			}
			for _, wallpaperEntry := range wallpaperNames {
				if wallpaperEntry.Name() == "meta.json" {
					continue
				}
				var wallpaper = Wallpaper{Path: "wallpapers/" + category.Name() + "/" + subcategory.Name() + "/" + wallpaperEntry.Name(), SDPath: "sd-wallpapers/" + category.Name() + "/" + subcategory.Name() + "/" + strings.ReplaceAll(wallpaperEntry.Name(), ".png", ".avif")}
				wallpaperList = append(wallpaperList, wallpaper)
			}
			wallpapers = append(wallpapers, WallpaperSubcategory{Name: cases.Title(language.Tag{}).String(strings.ReplaceAll(subcategory.Name(), "-", " ")), Wallpapers: wallpaperList, Meta: meta, BackgroundCoverImage: "sd-wallpapers/" + category.Name() + "/" + subcategory.Name() + "/" + strings.Replace(wallpaperNames[0].Name(), ".png", ".avif", 1)})
		}
		wallpaperCategories = append(wallpaperCategories, WallpaperCategory{Name: cases.Title(language.Tag{}).String(strings.ReplaceAll(category.Name(), "-", " ")), Subcategories: wallpapers})

	}

	return wallpaperCategories
}

var eventManager = events.New()

func statsMiddleware() fiber.Handler {
	return func(c fiber.Ctx) error {
		if c.Path() == "/api/sse" {
			return c.Next()
		}
		// Start timer
		start := time.Now()

		// Next routes
		err := c.Next()

		// Stop timer
		duration := time.Since(start)

		parsedIp := net.ParseIP(c.IP())
		country, _ := database.GetGeoIP().Country(
			parsedIp,
		)
		city, _ := database.GetGeoIP().City(
			parsedIp,
		)
		internalError := httpstats_dao.RegisterHttpTraffic(httpstats_dao.HttpRequest{
			Datetime:     time.Now().String(),
			Method:       c.Method(),
			Url:          c.Path(),
			Headers:      c.Request().Header.String(),
			Country:      string(country.Country.Names["en"]),
			City:         string(city.City.Names["en"]),
			UserAgent:    c.Get("User-Agent"),
			Referer:      c.Get("Referer"),
			ResponseCode: c.Response().StatusCode(),
			ResponseSize: len(c.Response().Body()),
			ResponseTime: int(duration.Milliseconds()),
			Ip:           c.IP(),
		})
		if internalError != nil {
			println(internalError.Error())
		}

		// Return the error if there was one
		return err
	}
}

func main() {
	var statsRoute = os.Getenv("STATS_ROUTE")
	var telegramBotToken = os.Getenv("TELEGRAM_BOT_TOKEN")
	var telegramChatId = os.Getenv("TELEGRAM_CHAT_ID")

	if statsRoute == "" {
		panic("STATS_ROUTE env variable is required")
	}
	if telegramBotToken == "" {
		panic("TELEGRAM_BOT_TOKEN env variable is required")
	}
	if telegramChatId == "" {
		panic("TELEGRAM_CHAT_ID env variable is required")
	}

	wallpapers := LoadWallpapers()
	engine := mustache.New("./views", ".mustache")
	// Only reload templates when not in production

	engine.Reload(true)
	// Initialize a new Fiber app
	app := fiber.New(fiber.Config{
		Views:       engine,
		ProxyHeader: "X-Real-Ip",
	})
	app.Use(statsMiddleware())

	app.Use(limiter.New(limiter.Config{
		LimitReached: func(c fiber.Ctx) error {
			return c.Status(429).SendFile("./public/429/index.html")
		},
		Next: func(c fiber.Ctx) bool {
			return !strings.HasPrefix(c.Path(), "/wallpapers/") || strings.HasPrefix(c.Path(), "/api/")
		},
		Expiration: time.Duration(10) * time.Second,
	}))

	app.Use("/wallpapers/*", func(c fiber.Ctx) error {
		// Prevent multiple hits on the same wallpaper to download by parts
		c.Response().Header.Set("Accept-Ranges", "none")
		parsedIp := net.ParseIP(c.IP())
		country, _ := database.GetGeoIP().Country(
			parsedIp,
		)
		city, _ := database.GetGeoIP().City(
			parsedIp,
		)
		countryCode := country.Country.IsoCode
		flagEmoji := utils.Country2flag(countryCode)
		var eventStruct = WallpaperDownloadEvent{
			Country:   country.Country.Names["en"],
			City:      city.City.Names["en"],
			Url:       c.Path(),
			FlagEmoji: flagEmoji,
		}
		eventManager.Emit("wallpaper_download", eventStruct)
		telegram_integration.NotifyWallpaperDownload(
			telegramBotToken,
			telegramChatId,
			eventStruct.Country,
			eventStruct.City,
			eventStruct.FlagEmoji,
			eventStruct.Url,
		)
		wallpapers_dao.AddDownload(c.Path(), c.IP())
		return c.Next()
	})

	app.Use(helmet.New())
	app.Use(etag.New(etag.Config{
		Next: func(c fiber.Ctx) bool {
			return strings.Contains(c.Path(), "/api/")
		},
	}))

	// Define a route for the GET method on the root path '/'
	app.Get("/", func(c fiber.Ctx) error {
		// Send a string response to the client
		return c.Render("home", fiber.Map{
			"Wallpapers": wallpapers,
		})
	})
	app.Get(statsRoute, func(c fiber.Ctx) error {
		wallpaperStats, err := wallpapers_dao.GetAll()
		if err != nil {
			return c.Status(500).SendString("Error fetching wallpaper stats")
		}
		groupBy := c.Query("groupby")
		if groupBy != "" {
			var err error
			httpStatsByGroup, err := httpstats_dao.GetStatsGroupBy(groupBy)
			if err != nil {
				return c.Status(500).SendString(err.Error())
			}
			return c.Render("stats", fiber.Map{
				"Wallpapers":       wallpaperStats,
				"HttpStatsByGroup": httpStatsByGroup,
				"GroupBy":          groupBy,
			})
		}
		httpStats, err := httpstats_dao.GetAll()
		if err != nil {
			return c.Status(500).SendString("Error fetching http stats")
		}
		return c.Render("stats", fiber.Map{
			"Wallpapers": wallpaperStats,
			"HttpStats":  httpStats,
		})
	})
	app.Get("/api/sse", func(c fiber.Ctx) error {
		ctx := c.Context()
		ctx.SetContentType("text/event-stream")
		ctx.Response.Header.Set("Cache-Control", "no-cache")
		ctx.Response.Header.Set("Connection", "keep-alive")
		ctx.Response.Header.Set("Transfer-Encoding", "chunked")
		ctx.Response.Header.Set("Access-Control-Allow-Origin", "*")
		ctx.Response.Header.Set("Access-Control-Allow-Headers", "Cache-Control")
		ctx.Response.Header.Set("Access-Control-Allow-Credentials", "true")
		ctx.Response.Header.Set("X-Accel-Buffering", "no")
		ctx.SetBodyStreamWriter(fasthttp.StreamWriter(func(w *bufio.Writer) {
			callbackFn := func(args ...interface{}) {
				eventStruct := args[0].(WallpaperDownloadEvent)
				json, _ := json.Marshal(eventStruct)

				fmt.Fprintf(w, "data: %s\n\n", json)
				w.Flush()
			}
			eventManager.On("wallpaper_download", callbackFn)
			time.Sleep(time.Minute * 10) // 10 minutes
			eventManager.RemoveListener("wallpaper_download", callbackFn)
		}))
		return nil
	})
	app.Get("/*", static.New("./public"))
	app.All("*", func(c fiber.Ctx) error {
		return c.Status(404).SendFile("./public/404/index.html")
	})

	// Start the server on port 3000
	log.Fatal(app.Listen(":3000"))

}
