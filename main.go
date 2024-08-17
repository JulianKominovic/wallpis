package main

import (
	"encoding/json"
	"fmt"
	"io/fs"
	"log"
	"os"
	"strings"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cache"
	"github.com/gofiber/fiber/v3/middleware/etag"
	"github.com/gofiber/fiber/v3/middleware/helmet"
	"github.com/gofiber/fiber/v3/middleware/limiter"
	"github.com/gofiber/fiber/v3/middleware/static"
	"github.com/gofiber/template/mustache/v2"
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

func main() {

	wallpapers := LoadWallpapers()
	engine := mustache.New("./views", ".mustache")
	// Only reload templates when not in production

	engine.Reload(true)
	// Initialize a new Fiber app
	app := fiber.New(fiber.Config{
		Views: engine,
	})

	app.Use(helmet.New())
	app.Use(etag.New())
	app.Use(cache.New())

	// Initialize default config
	app.Use(limiter.New(limiter.Config{
		LimitReached: func(c fiber.Ctx) error {
			return c.Status(429).SendFile("./public/429/index.html")
		},
		Next: func(c fiber.Ctx) bool {
			return !strings.Contains(c.Path(), "/wallpapers/")
		},
		Expiration: time.Duration(10) * time.Second,
	}))

	// Define a route for the GET method on the root path '/'
	app.Get("/", func(c fiber.Ctx) error {
		// Send a string response to the client
		return c.Render("home", fiber.Map{
			"Title":      "Wallpis - Home",
			"Wallpapers": wallpapers,
			"toTitleCase": func(s string) string {
				return cases.Title(language.Tag{}).String(s)
			},
		})
	})
	app.Get("/*", static.New("./public"))
	app.All("*", func(c fiber.Ctx) error {
		return c.Status(404).SendFile("./public/404/index.html")
	})

	// Start the server on port 3000
	log.Fatal(app.Listen(":3000"))
}
