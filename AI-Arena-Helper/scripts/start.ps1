$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath (Split-Path -Parent $PSScriptRoot)
Write-Host 'Open http://127.0.0.1:3210 after the server is ready. Ctrl+C stops the server.'
& npm.cmd start
