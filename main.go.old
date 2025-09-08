package main

import (
	"fmt"
	"net/url"

	icons "github.com/RewstApp/agent-smith-tray/icon"
	"github.com/getlantern/systray"
	"github.com/gorilla/websocket"
	"github.com/hashicorp/go-hclog"

	_ "embed"
)

// Constants
const serverPort = 50001

// Global state
var conn *websocket.Conn
var logger hclog.Logger

// Status helpers
func setOnline() {
	systray.SetIcon(icons.Online)
	systray.SetTooltip("Online")
}

func setReconnecting() {
	systray.SetIcon(icons.Offline)
	systray.SetTooltip("Reconnecting...")
}

func setOffline() {
	systray.SetIcon(icons.Offline)
	systray.SetTooltip("Offline")
}

// Event helpers
func onReady() {
	// Set the tray icon (must be .ico on Windows, .png on Linux/macOS)
	systray.SetIcon(icons.Offline)

	// Offline is the starting status
	setOffline()

	mQuit := systray.AddMenuItem("Quit", "Quit the app")

	// Handle menu events
	go func() {
		for range mQuit.ClickedCh {
			systray.Quit()
		}
	}()

	// Define WebSocket URL
	u := url.URL{Scheme: "ws", Host: fmt.Sprintf("localhost:%d", serverPort), Path: "/ws"}
	logger.Info("Connecting to server", "server", u.String())

	// Dial the WebSocket server
	conn, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		logger.Error("Dial error", "error", err)
	}

	// Read loop
	go func() {
		for {
			msgType, message, err := conn.ReadMessage()
			if err != nil {
				logger.Error("Read failed", "error", err)
				return
			}
			logger.Info("Received message", "type", msgType, "message", string(message))

			switch string(message) {
			case "AgentOnline":
				setOnline()
			case "AgentOffline":
				setOffline()
			case "AgentReconnecting":
				setReconnecting()
			}
		}
	}()
}

func onExit() {
	// Cleanup if needed
	conn.Close()
}

func main() {
	// Create logger for consistent lg
	logger = hclog.New(&hclog.LoggerOptions{
		Name:  "agent-smith-tray",
		Level: hclog.Debug,
	})

	// Block and run the tray icon
	systray.Run(onReady, onExit)
}
