package main

import (
	"embed"

	"github.com/hashicorp/go-hclog"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Create logger for consistent lg
	logger := hclog.New(&hclog.LoggerOptions{
		Name:  "agent-smith-tray",
		Level: hclog.Debug,
	})

	// Create an instance of the app structure
	app := NewApp(logger)

	// Create application with options
	err := wails.Run(&options.App{
		Title:  "Agent Smith",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.startup,
		Bind: []any{
			app,
		},
	})

	if err != nil {
		logger.Error("Failed to run the tray executable", "error", err.Error())
	}
}
