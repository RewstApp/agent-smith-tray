#Requires -Version 7


if ($IsWindows) {
    # Override the wails.json to set the correct version
    $config = Get-Content -Raw -Path "wails.json" | ConvertFrom-Json
    $config.info.productVersion = $(cz version -p)
    $config | ConvertTo-Json -Depth 10 | Set-Content "wails.json"

    # Build the installer
    wails build -nsis
}