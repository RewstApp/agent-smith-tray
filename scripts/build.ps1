#Requires -Version 7

if ($IsWindows) {
    # Copy the plugin installer folder
    Copy-Item "agent-smith-httpd.win.exe" "./build/agent-smith-httpd.win.exe"

    # Build the installer
    npm run dist
}