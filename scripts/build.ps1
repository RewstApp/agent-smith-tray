#Requires -Version 7


if ($IsWindows) {
    # Install go package 
    go install github.com/wailsapp/wails/v2/cmd/wails@latest

    # Set build output 
    $buildOutput = "agent-smith-tray-installer.win.exe"

    # Build the installer
    wails build -nsis -o $buildOutput -v 0

    Write-Output "./build/bin/$buildOutput"
}