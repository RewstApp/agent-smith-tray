package main

import (
	"context"
	"fmt"
	"net/url"

	"github.com/RewstApp/agent-smith-tray/icon"
	"github.com/getlantern/systray"
	"github.com/gorilla/websocket"
	"github.com/hashicorp/go-hclog"
)

// Constants
const serverPort = 50001

// App struct
type App struct {
	ctx    context.Context
	conn   *websocket.Conn
	logger hclog.Logger
}

// NewApp creates a new App application struct
func NewApp(logger hclog.Logger) *App {
	return &App{
		logger: logger,
	}
}

// Status helpers
func (a *App) setOnline() {
	systray.SetIcon(icon.Online)
	systray.SetTooltip("Online")
}

func (a *App) setReconnecting() {
	systray.SetIcon(icon.Offline)
	systray.SetTooltip("Reconnecting...")
}

func (a *App) setOffline() {
	systray.SetIcon(icon.Offline)
	systray.SetTooltip("Offline")
}

// Event helpers
func (a *App) onReady() {
	// Set the tray icon (must be .ico on Windows, .png on Linux/macOS)
	systray.SetIcon(icon.Offline)

	// Offline is the starting status
	a.setOffline()

	mQuit := systray.AddMenuItem("Quit", "Quit the app")

	// Handle menu events
	go func() {
		for range mQuit.ClickedCh {
			systray.Quit()
		}
	}()

	// Define WebSocket URL
	u := url.URL{Scheme: "ws", Host: fmt.Sprintf("localhost:%d", serverPort), Path: "/ws"}
	a.logger.Info("Connecting to server", "server", u.String())

	// Dial the WebSocket server
	conn, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		a.logger.Error("Dial error", "error", err)
	}

	// Read loop
	go func() {
		for {
			msgType, message, err := conn.ReadMessage()
			if err != nil {
				a.logger.Error("Read failed", "error", err)
				return
			}
			a.logger.Info("Received message", "type", msgType, "message", string(message))

			switch string(message) {
			case "AgentOnline":
				a.setOnline()
			case "AgentOffline":
				a.setOffline()
			case "AgentReconnecting":
				a.setReconnecting()
			}
		}
	}()
}

func (a *App) onExit() {
	// Cleanup if needed
	if a.conn != nil {
		a.conn.Close()
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	// Run the tray icon
	go systray.Run(a.onReady, a.onExit)
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}
