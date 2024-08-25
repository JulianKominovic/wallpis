package telegram_integration

import (
	"fmt"
	"time"

	"github.com/gofiber/fiber/v3/client"
)

func NotifyWallpaperDownload(botToken string, chatId string, country string, city string, flag string, url string) {
	cc := client.New()
	cc.SetTimeout(10 * time.Second)
	text := fmt.Sprintf("📥 New wallpaper download from %s, %s\n🔗 %s", country, city, url)
	println(text)
	resp, err := cc.Post(fmt.Sprintf(("https://api.telegram.org/bot%s/sendMessage"), botToken), client.Config{
		Body: map[string]string{
			"chat_id": chatId,
			"text":    text,
		},
		Header: map[string]string{
			"Content-Type": "application/json",
		},
	})
	if err != nil {
		println(err.Error())
	}
	if resp.StatusCode() != 200 {
		println("Telegram API error")
		println(resp.StatusCode())
		println(resp.String())

	}
}
