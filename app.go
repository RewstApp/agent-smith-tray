package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/url"
	"os"
	"path/filepath"
	"time"

	"github.com/RewstApp/agent-smith-tray/icon"
	"github.com/RewstApp/agent-smith-tray/msg"
	"github.com/getlantern/systray"
	"github.com/gorilla/websocket"
	"github.com/hashicorp/go-hclog"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// Constants
const serverPort = 50001
const retryTimeout = 2 * time.Second
const configDirName = "AgentSmithTray"
const configFileName = "config.json"
const configLinksKey = "links"

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

func (a *App) connectWithRetry(url url.URL) *websocket.Conn {
	var conn *websocket.Conn
	var err error

	for {
		conn, _, err = websocket.DefaultDialer.Dial(url.String(), nil)
		if err != nil {
			a.logger.Error("Failed to connect, retrying", "error", err, "timeout", retryTimeout)
			time.Sleep(retryTimeout)
			continue
		}
		a.logger.Info("Connected to server", "url", url.String())
		break
	}

	return conn
}

// Event helpers
func (a *App) onReady() {
	// Set the tray icon (must be .ico on Windows, .png on Linux/macOS)
	systray.SetIcon(icon.Offline)

	// Offline is the starting status
	a.setOffline()

	mShow := systray.AddMenuItem("Show", "Show the app")
	mQuit := systray.AddMenuItem("Quit", "Quit the app")

	// Handle menu events
	go func() {
		for {
			select {
			case <-mQuit.ClickedCh:
				systray.Quit()
			case <-mShow.ClickedCh:
				runtime.EventsEmit(a.ctx, "message:clear")
				runtime.Show(a.ctx)
			}
		}
	}()

	// Read loop
	go func() {
		// Define WebSocket URL
		u := url.URL{Scheme: "ws", Host: fmt.Sprintf("localhost:%d", serverPort), Path: "/ws"}
		a.logger.Info("Connecting to server", "server", u.String())

		// Dial the WebSocket server
		conn := a.connectWithRetry(u)

		for {
			_, message, err := conn.ReadMessage()
			if err != nil {
				a.logger.Error("Read failed", "error", err)
				conn = a.connectWithRetry(u)
				continue
			}

			msgType, content := msg.Parse(string(message))

			a.logger.Info("Received message", "type", msgType, "content", content)

			switch msgType {
			case "AgentStatus":
				switch content {
				case "Online":
					a.setOnline()
				case "Offline":
				case "Stopped":
					a.setOffline()
				case "Reconnecting":
					a.setReconnecting()
				}
			case "AgentReceivedMessage":
				var msg msg.Message
				err = json.Unmarshal([]byte(content), &msg)
				if err == nil {
					a.onReceivedMessage(msg)
				} else {
					a.logger.Error("Failed to parse message", "error", err)
				}
			}
		}
	}()
}

func (a *App) onExit() {
	// Cleanup if needed
	if a.conn != nil {
		a.conn.Close()
	}

	// Stop the app
	runtime.Quit(a.ctx)
}

func (a *App) onReceivedMessage(message msg.Message) {
	a.logger.Info("Received message", "type", message.Type, "content", message.Content)

	runtime.EventsEmit(a.ctx, "message:"+message.Type, message.Content)
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	// Run the tray icon
	go systray.Run(a.onReady, a.onExit)
}

func (a *App) ShowWindow() {
	runtime.WindowSetAlwaysOnTop(a.ctx, true)
	runtime.WindowShow(a.ctx)
}

func (a *App) getConfigPath() (string, error) {
	dir, err := os.UserConfigDir()
	if err != nil {
		return "", err
	}

	return filepath.Join(dir, configDirName, configFileName), nil
}

func (a *App) GetStoredLinks() string {
	configPath, err := a.getConfigPath()
	if err != nil {
		a.logger.Error("Failed to get config path", "error", err)
		return "[]"
	}

	data, err := os.ReadFile(configPath)
	if err != nil {
		a.logger.Error("Failed to read user config", "error", err, "path", configPath)
		return "[]"
	}

	var settings map[string]any
	err = json.Unmarshal(data, &settings)
	if err != nil {
		a.logger.Error("Failed to parse settings file", "error", err)
		return "[]"
	}

	links, ok := settings[configLinksKey]
	if !ok {
		return "[]"
	}

	return links.(string)
}

func (a *App) SetStoredLinks(links string) {
	configPath, err := a.getConfigPath()
	if err != nil {
		a.logger.Error("Failed to get config path", "error", err)
		return
	}

	data, err := os.ReadFile(configPath)
	if err != nil {
		a.logger.Error("Failed to read user config", "error", err, "path", configPath)
	}

	var settings map[string]any
	err = json.Unmarshal(data, &settings)
	if err != nil {
		a.logger.Error("Failed to parse settings file", "error", err)
	}

	if settings == nil {
		settings = make(map[string]any)
	}

	settings[configLinksKey] = links

	data, err = json.MarshalIndent(&settings, "", "  ")
	if err != nil {
		a.logger.Error("Failed to serialize the settings file", "error", err)
		return
	}

	configDir := filepath.Dir(configPath)
	err = os.MkdirAll(configDir, os.ModePerm)
	if err != nil {
		a.logger.Error("Failed to make config directory", "error", err)
		return
	}

	err = os.WriteFile(configPath, data, os.ModePerm)
	if err != nil {
		a.logger.Error("Failed to write to settings file", "error", err)
		return
	}

	a.logger.Info("Settings file saved", "path", configPath)
}
