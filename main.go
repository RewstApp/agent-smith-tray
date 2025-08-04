package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"os"

	"github.com/getlantern/systray"
	"github.com/gorilla/websocket"
	"github.com/hashicorp/go-hclog"

	_ "embed"
)

//go:embed icon/online.ico
var onlineIconData []byte

//go:embed icon/offline.ico
var offlineIconData []byte

const serverPort = 50001

func main() {
	// Create logger for consistent lg
	logger := hclog.New(&hclog.LoggerOptions{
		Name:  "agent-smith-tray",
		Level: hclog.Debug,
	})

	// Define WebSocket URL
	u := url.URL{Scheme: "ws", Host: fmt.Sprintf("localhost:%d", serverPort), Path: "/ws"}
	logger.Info("Connecting to server", "server", u.String())

	// Dial the WebSocket server
	conn, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		logger.Error("Dial error", "error", err)
	}
	defer conn.Close()

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
				systray.SetIcon(onlineIconData)
			case "AgentOffline":
			case "AgentReconnecting":
				systray.SetIcon(offlineIconData)
			}
		}
	}()

	systray.Run(onReady, onExit)
}

type Status struct {
	Cpu      int  `json:"cpu"`
	Memory   int  `json:"memory"`
	Disk     int  `json:"disk"`
	Network  int  `json:"network"`
	IsOnline bool `json:"is_online"`
}

func UpdateStatus() {
	resp, err := http.Get("http://localhost:6060/status")
	if err != nil {
		systray.SetTooltip(fmt.Sprintf("Failed to fetch status: %v", err))
		return
	}
	defer resp.Body.Close()

	var status Status
	json.NewDecoder(resp.Body).Decode(&status)

	onlineString := "Offline"
	if status.IsOnline {
		onlineString = "Online"
	}

	systray.SetTooltip(fmt.Sprintf("CPU: %v%%\n", status.Cpu) + fmt.Sprintf("Memory: %v%%\n", status.Memory) + fmt.Sprintf("Disk: %v%%\n", status.Disk) + fmt.Sprintf("Network: %v%%\n", status.Network) + onlineString)
}

func onReady() {
	// Set the tray icon (must be .ico on Windows, .png on Linux/macOS)
	systray.SetIcon(offlineIconData)

	systray.SetTitle("Agent Smith")
	systray.SetTooltip("Loading status...")

	mQuit := systray.AddMenuItem("Quit", "Quit the app")

	// Handle menu events
	go func() {
		for range mQuit.ClickedCh {
			systray.Quit()
			os.Exit(0)
		}
	}()
}

func onExit() {
	// Cleanup if needed
}
