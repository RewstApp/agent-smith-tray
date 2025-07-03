package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/getlantern/systray"

	_ "embed"
)

//go:embed icon/logo-rewsty.ico
var iconData []byte

func main() {
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
	systray.SetIcon(iconData) // iconData is a []byte for icon file

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

	// Handle updates
	go func() {
		for {
			UpdateStatus()
			time.Sleep(time.Millisecond * 250)
		}
	}()
}

func onExit() {
	// Cleanup if needed
}
