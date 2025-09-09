#Requires -Version 7


if ($IsWindows) {
    # Set build output 
    $buildOutput = "agent-smith-tray-installer.win.exe"

    # Build the installer
    wails build -nsis -o $buildOutput -v 0

    Write-Output "./build/bin/$buildOutput"
}