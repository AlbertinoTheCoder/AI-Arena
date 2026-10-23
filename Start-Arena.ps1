$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
Write-Host 'Open http://127.0.0.1:3210 after the server is ready. Ctrl+C stops the server.'
& node server.mjs
