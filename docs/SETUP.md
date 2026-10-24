# Installation on Windows

Install Node.js 22+ and the Cursor CLI, Codex CLI, or both. Sign in through each provider's CLI before using its models. Arena uses those existing accounts; it does not ask for API keys. Keep your authenticated CLI configuration outside this repository.

Open this folder in VS Code. Choose **Terminal → New Terminal** and run:

```powershell
npm.cmd run doctor
npm.cmd start
```

Open http://127.0.0.1:3210/. Ctrl+C stops the server. To use another port, set `$env:PORT = '3211'` before starting. Run `npm.cmd run refresh-models` and restart after updating CLI accounts or models. Catalog entries are not proof of account entitlement.

## Optional neural speech

Install Python 3.12+ first. From the repository folder:

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

The current development PC already has this environment. Speech requires Internet access. Test voice uses the speech service without asking an AI model. Use the browser audio player's play button if autoplay is blocked.

## When something fails

- **Site offline:** keep the server terminal open and use the numeric address printed there.
- **Missing CLI:** run doctor; install/sign in to the desired CLI. JavaScript entrypoints can be overridden using ARENA_CURSOR_ENTRY and ARENA_CODEX_ENTRY.
- **Access or usage error:** check the same account and exact model in that provider. Arena does not retry or silently substitute another model.
- **Slow Cursor replies:** each turn launches a new CLI process and shows its completed result. Compare the same model, thinking strength and Fast setting; the first reply also follows a 1.1-second dice animation. Later turns include a one-second pause. The growing transcript adds context. Cursor's open app may show streamed text sooner.
- **Speech unavailable:** confirm the local Python environment, Internet access and selected voice. The external speech service can be unavailable.

Saved public catalogs are used when a local listing/cache is unavailable. They may be stale; use Test selection to check your exact account access.
