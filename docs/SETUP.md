# Windows helper and online setup

Open [AI Arena online](https://albertinothecoder.github.io/AI-Arena/). The page guides you through every step below if it cannot reach the helper. No model request starts while connecting or pairing.

## 1. Install requirements

- Install [Node.js 22 or later](https://nodejs.org/en/download).
- Install at least one CLI: [Cursor CLI](https://cursor.com/docs/cli/installation) or [Codex CLI](https://github.com/openai/codex#installation). The Cursor desktop app alone does not guarantee the CLI is installed.
- Sign in to the CLI account you want to use. Codex installation and login:

```powershell
npm.cmd install -g @openai/codex
codex login
```

For Cursor, follow its official Windows installation guide and run `agent login`. On the standard installation, the launcher is also at `$env:LOCALAPPDATA\cursor-agent\agent.cmd`. Restart your terminal after installing a CLI if the command is not found.

## 2. Download, extract, and start

Download [AI-Arena-Helper-Windows.zip](https://github.com/AlbertinoTheCoder/ai-arena/releases/latest/download/AI-Arena-Helper-Windows.zip), extract **all** files into a permanent folder and double-click **Start-Arena.cmd**. Do not launch it from inside the ZIP. The helper opens the online interface and prints a pairing code. Keep its window open; Ctrl+C stops it.

Alternatively, open a terminal in the extracted folder:

```powershell
node scripts/helper-start.mjs
```

The existing development checkout remains at E:\projects\WebProjects\ai-arena. You can continue using `npm.cmd start` there and opening http://127.0.0.1:3210/ directly. Both entrypoints run the same backend. Starting the helper does not install packages, generate replies or accept terms for you.

## 3. Pair the browser

Allow the browser's local-network access prompt for the published site if requested. Select the port shown by the helper (3210 by default), copy its pairing code into the online page, and click **Abbina e apri Arena**. Read and accept the required terms yourself, then choose models and explicitly start a conversation. Optional topic permission remains separate.

The paired token lives in this browser tab's session storage, expires after 12 hours, and is invalidated when the helper restarts or you disconnect. Pair again after a restart. CLI credentials stay on the PC. Every visitor needs their own helper and CLI accounts. localhost on a phone means that phone, not your computer.

## Neural speech setup

Start-Arena.cmd now checks the neural voice runtime and configures it automatically on first launch when Python 3.12+ is available. It creates a local .venv, installs the pinned edge-tts and FFmpeg helper packages from PyPI, then verifies them. No administrator rights are needed.

If voices fail, double-click **Setup-Voices.cmd** in the same extracted folder and read its result. If Python is missing, install [Python 3.12+](https://www.python.org/downloads/windows/) and run Setup-Voices.cmd again. For manual installation:

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Speech requires Internet access and sends spoken text to Microsoft's service through edge-tts. It is optional; debates work without Python. The development PC already has its .venv. Voice playback is queued; use the visible player if autoplay is blocked.

## Troubleshooting

- **No connection:** leave the helper window open, verify the port and permit local-network access in browser site settings. Try updated Chrome or Edge. Do not open router ports or disable browser security.
- **Older helper:** download the latest ZIP. An older local Arena lacks the pairing endpoint.
- **EADDRINUSE:** another process owns the port. Close the other helper or set `$env:PORT = '3211'` in PowerShell, then run `node scripts/helper-start.mjs`. Enter 3211 on the online page.
- **Wrong pairing code:** copy the code from the currently running helper. After five pairing attempts, wait one minute.
- **Missing CLI / access / quota:** run `npm.cmd run doctor`, sign in to the provider and verify that the exact model is included in your account. Catalog entries do not prove entitlement. ARENA_CURSOR_ENTRY and ARENA_CODEX_ENTRY can override JavaScript entrypoint paths.
- **Catalog out of date:** run `npm.cmd run refresh-models`, then restart. Saved public metadata is a fallback when a local listing/cache is unavailable.
- **Slow first reply:** the opening dice roll lasts five seconds; each reply launches a CLI process. Streaming shows text as it arrives but does not accelerate model generation.

Only the exact published GitHub origin is allowed cross-origin access. Health checks reveal only helper identity/version. All other remote API requests require a paired bearer token; mutations retain the Arena token and terms/usage checks. Browser access uses header authentication rather than third-party cookies. Do not share the pairing code.
