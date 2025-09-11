#Requires -Version 7


if ($IsWindows) {
    # Override the wails.json to set the correct version
    $config = Get-Content -Raw -Path "wails.json" | ConvertFrom-Json
    $config.info.productVersion = $(cz version -p)
    $config | ConvertTo-Json -Depth 10 | Set-Content "wails.json"

    # Copy the plugin installer folder
    Copy-Item "agent-smith-httpd.win.exe" "./build/windows/installer/agent-smith-httpd.win.exe"

    # Build the installer
    wails build -nsis
}