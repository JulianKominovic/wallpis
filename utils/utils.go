package utils

import "strings"

func Country2flag(countryCode string) string {
	var flagEmoji strings.Builder
	countryCode = strings.ToUpper(countryCode)
	for _, char := range countryCode {
		flagEmoji.WriteRune(rune(char) + 0x1F1A5)
	}
	return flagEmoji.String()
}
