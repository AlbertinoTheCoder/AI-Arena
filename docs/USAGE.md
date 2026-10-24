# AI Arena — local CLI conversations

## Start

```powershell
Set-Location -LiteralPath 'E:\projects\WebProjects\ai-arena'
npm.cmd start
```

Open http://127.0.0.1:3210 and leave PowerShell running. No dependency installation is needed (Node 22+). `npm.cmd start` refreshes the Cursor model listing without generating replies, then starts the website. If that lookup fails, the saved listing is used. Codex models and reasoning capabilities come from the installed CLI's models cache. After changing accounts or updating CLIs, restart the website.

## Choose both participants

Each participant can use **Cursor CLI / Cursor account** or **Codex CLI / OpenAI account**, independently. A GPT model in Cursor runs through Cursor; it does not require Codex access. Grok, Claude, Gemini, and other Cursor-listed models stay on the Cursor route. Codex has its own separate model list. No extra API key is needed by the website.

Choose the model, thinking strength, and Fast mode separately. Only combinations listed by the selected CLI are accepted. Unsupported Fast mode is disabled. Defaults are Grok 4.7 Low through Cursor and GPT-6.1 Sol Low through Codex, both with Fast mode off. Changing settings applies to the next conversation; an active run keeps its original selection. Settings are remembered in your browser.

- Cursor thinking and Fast mode resolve to exact listed model IDs, such as `grok-4.7-low` or `grok-4.7-low-fast`.
- Codex reasoning uses `-c model_reasoning_effort="low"` (or your selection). Fast mode uses `-c service_tier="fast"`; off explicitly uses `service_tier="default"` to avoid inheriting a user-level Fast setting.
- Fast mode can increase usage or require account eligibility. It is independent of thinking depth and does not guarantee a particular response time.
- **Listed by this CLI** means a catalog entry, not confirmed entitlement. **Test selection** requests one short real reply using the exact provider/model/thinking/Fast combination. Check the usage box first. Success and failures are shown beside that selection. Tests and real runs share a single-operation guard; Stop can cancel either. Results are kept in server memory until restart. A past success cannot guarantee future quota or service availability.

Enter a topic, select limits, accept account usage, and press Start. A fair dice roll chooses the opening participant, then they alternate. One turn means one reply. Replies appear as they finish; token streaming is not enabled. Export saves the transcript with the selected settings. No automatic conversations, retries, or model substitutions.

## Controls and boundaries

Default 4 replies, maximum 60 words and 2 sentences/reply, timeout 120 seconds/reply. Maximum 12 replies, 20 minutes/run, 300 seconds/reply, 2,000 topic characters, 16,000 reply characters, 256 KiB stdout. Output length is enforced after generation; it is not a billing cap. Every turn sends the bounded transcript again as fresh context.

Prompts are piped to stdin through direct Node entrypoints with `shell:false`; they never become shell command text. Cursor uses `-p --trust --mode ask --output-format json`; Codex uses read-only sandbox, disables `unreal-mcp` and `unityMCP`, and uses `exec --skip-git-repo-check --ephemeral --output-last-message <file> -`. Only Cursor JSON result text or Codex's final reply file is relayed.

Separate `.arena/<run-id>/grok` and `.arena/<run-id>/codex` directories isolate participants' working folders, even if both use the same provider. The directory names are internal slot names. These are workspace separation and CLI controls, not an OS security boundary. Global CLI settings, credentials and MCP configuration may still apply. No unrelated project is used as a working folder.

Stop cancels the active subprocess tree and prevents another reply. Closing a tab does not stop a run. Ctrl+C stops a foreground server. Transcript lives in memory, so export before restarting. CLI reply files remain in ignored `.arena` folders. The conversation interrupted for the model-picker update was backed up to `.arena/before-model-update.json`.

The server binds only to 127.0.0.1, validates Host and Origin, requires a random session token for mutations, bounds request sizes, and renders model output as text. No remote assets. Use the printed numeric address rather than localhost.

## Troubleshooting

```powershell
npm.cmd run doctor
npm.cmd test
npm.cmd run refresh-models
```

Doctor uses help only; automated tests use local fake responses and subprocesses without AI calls. Refresh the catalog and restart after changing CLI accounts.

If needed, log in separately:

```powershell
& "$env:LOCALAPPDATA\cursor-agent\agent.cmd" login
codex login
```

CLI entrypoints are discovered in the standard Cursor local installation and roaming npm Codex installation. `ARENA_CURSOR_ENTRY` and `ARENA_CODEX_ENTRY` can override JavaScript entrypoint paths. The direct launch avoids Windows wrapper quoting and Cursor promotion-lock issues without modifying either installation.

If the port is busy, set `$env:PORT = '3211'` before starting and open http://127.0.0.1:3211. When Start is disabled, the page reports offline status next to it and reconnects automatically after the server returns.

References: [Codex configuration](https://learn.chatgpt.com/docs/config-file/config-reference), [Cursor CLI usage](https://prod.cursor.com/docs/cli/using). Exact CLI flags and model settings were checked against the installed CLIs and catalogs on October 23, 2026.

## Reply language and free neural voices

Reply language defaults to English and is explicitly repeated after the transcript on every model turn. It guides generation; it is not an automatic translator.

The AI voices panel now uses edge-tts through the local backend and Microsoft's online neural speech service. It works even when Windows has no English speech voices. An English sample was generated and played to completion in the in-app browser, with no media error. There are 322 voices in the installed catalog. No TTS API key or subscription is needed; Internet access is required and the text you choose to speak is sent to that service. Voice service availability can change.

Use Test voice to check audio without a model call. Enable Read new replies aloud for upcoming replies, or Replay on an existing message. A/B have separate voice preferences, automatic matching by detected language, speaking speed and Stop audio. If browser autoplay is blocked, press play in the visible audio player. Missing-language detection uses the selected Reply language as fallback. Mixed-language text uses one selected voice per message.

Each voice menu starts with two **Narrator presets**: a deep male voice and a deep female voice. A preset follows the detected language (English, Italian, French, Spanish, German have hand-picked voices; other languages fall back to the first voice of the matching gender) and lowers the pitch through edge-tts, −15 Hz for the male narrator and −10 Hz for the female one. The pitch value travels with the speech request and the server accepts only `±0–40Hz`; individual voices from the full list keep their natural pitch.

Neural requests go through a token-protected local endpoint. Voice IDs are validated against the catalog; text goes to the helper through stdin with no shell interpolation. One synthesis request runs at a time, with text/output bounds, cancellation and a 50-second timeout. Audio is returned in memory to the browser. No conversation starts as part of a voice test.

The project-local `.venv` contains edge-tts 7.3.1. It is ignored by Git. For a fresh installation, create a Python 3.12+ environment in `.venv` and install `requirements.txt`; the current PC is already set up. Main website startup remains `npm.cmd start`.

Reference: https://github.com/rany2/edge-tts
## Concise debates and tighter speech pacing

The updated studio UI keeps Start/Stop visible and puts participants, rules, and voices into collapsible sections. The conversation has its own scroll area with separate A/B colors and replay buttons.

New-run defaults are a polite debate, maximum 60 words and 2 sentences per reply. Limits are hard caps: Markdown is removed and excess sentences/words are cut before display, speech, and relay to the other participant. Shortening is labeled in the transcript. There are no extra model calls to rewrite long replies. Models may still generate excess text internally, so these caps are not billing limits. Short/brief instructions and explicit word/sentence caps in the topic can tighten the selected limits further. Existing conversation history is preserved; new debate and length rules apply to the next run.

Styles: Polite debate assigns opposing positions with civil rebuttals. Heated debate adds confrontational language and sarcasm. Roast permits personal jabs between the fictional AI opponents while still requiring an argument; threats, protected-class slurs, and targeting real people are excluded. Open discussion removes assigned sides. The role prompts ask each model to rebut a specific claim, keep its position, and avoid reflexive agreement; model behavior remains probabilistic.

Speech defaults to 1.3x with Tight pauses enabled. Tight pauses uses the project-local FFmpeg helper to shorten silence intervals of at least 160 ms while retaining short phrase breaks. Natural timing remains available by unchecking Tight pauses; speed now goes up to 2x and changes the current playback immediately. Both settings are remembered in the browser. The audio comparison sample measured 8.35 seconds naturally versus 6.72 seconds with pauses tightened, or about 5.17 seconds at 1.3x.

The TTS runtime also requires imageio-ffmpeg 0.6.0, already installed in this project's `.venv` and pinned in requirements.txt. Audio processing runs locally after online voice synthesis.

### Five-second TTS prefetch

During playback, the next available reply begins speech generation when about five seconds of actual listening time remain. The calculation accounts for playback speed, and a reply arriving later starts generation immediately. Only one reply ahead is prepared, and it never plays over the current audio. If synthesis needs more than five seconds or the next reply is not ready, a gap can still remain. Stop audio and Stop conversation cancel pending generation. Refresh the page after this update to load the new queue code; no server restart is required.

## Terms, optional Codex topic ideas, and the opening roll

The app now requires explicit acceptance of the current Terms of Use before generation, model tests, topic suggestions, speech, or event-stream access. Read the full text in the app or TERMS.md. Acceptance is recorded locally per browser with its version and time. No checkbox is preselected. Mandatory terms do not grant the separate optional Codex topic permission.

After required acceptance, the optional prompt offers Enable & generate 3 topics or Not now. The **Ideas from** selector, shown in the prompt and above the suggestion list, chooses which CLI generates them: Codex CLI (GPT-6.1 Sol) or Cursor CLI (Grok 4.7), both at Low thinking with Fast mode off. The choice is remembered in your browser and can be changed between batches; the permission covers both CLIs. Codex uses `--output-schema` for strict JSON; Cursor runs in ask mode and its JSON reply is parsed from the result text, so a malformed reply fails without retry. Each enabled action requests one batch of exactly three topics; the dice button beside the ideas requests another batch. Reloading restores the previous batch without generating one. The request includes the selected language and previous topic batch, not the chat transcript. There are no automatic retries, a five-second cooldown and a 12-batch hourly cap per browser. Withdraw permission using Topic permission at the bottom of the control panel. Consent records and topic cache stay in ignored .arena files.

This is a local trusted-user application, not a multi-user hosted account system. Each person running a clone uses the authenticated CLIs on that person's local backend. An installation operator must review and adapt the terms, identity/contact details and data practices before operating a public service. No disclaimer guarantees immunity from legal responsibility.

Pressing Start now rolls a fair six-sided die in the chat before a model request begins. Odd opens A; even opens B. A/B debate positions remain the same regardless of opening order. Stop during the roll cancels the run without a model request. Thinking is shown with an animated orbit, waveform and glow; motion is reduced when the browser requests reduced motion.

For keeping this local folder in VS Code while publishing its source to GitHub, read GITHUB.md. The source can be published; GitHub Pages cannot run this Node/CLI backend.
