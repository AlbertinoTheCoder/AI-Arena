@echo off
setlocal
rem Modifica questa porta se necessario (1024-65535).
set "PORT=3210"

cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js 22 or later from https://nodejs.org/ then reopen this file.
  pause
  exit /b 1
)
node scripts\helper-start.mjs
if errorlevel 1 pause
