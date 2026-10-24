# How AI Arena works

The browser talks to a loopback Node HTTP server. Server-sent events publish run state, bounded live drafts and completed replies. Each turn starts the selected provider's CLI in a dedicated .arena/<run-id>/<slot> workspace, sends a bounded prompt through stdin and streams reply text. Cursor uses NDJSON partial-output events; Codex uses an ephemeral read-only app-server thread over stdio JSON-RPC. Topic suggestions and model checks continue to use the existing non-streaming CLI commands. A fair dice roll chooses the opener; participants then alternate.

The backend validates model combinations, enforces usage consent, turn/word/sentence/time/output limits and strips Markdown before display, speech and relay. Stop cancels the subprocess tree. No model calls run on page load and no failed call is automatically retried.

CLI discovery and execution live in src/cli.mjs; src/models.mjs resolves catalog combinations; src/rules.mjs defines discussion rules. src/consent.mjs records local versioned consent. The HTTP routes and run loop live in src/server.mjs. Settings and topic-source selection are remembered by the browser.

Speech flows through public/neural.js to the token-protected local endpoint. src/tts.py synthesizes through edge-tts and optionally tightens pauses using a local FFmpeg helper. The queue prepares at most one next reply five listening seconds before the current clip ends. Narrator pitch and language-specific pronunciation affect speech only.

config contains public catalog metadata. .arena holds ignored local run files and consent data; .venv holds ignored Python dependencies. These folders are retained across source updates. Workspace separation is not an OS security boundary: global CLI settings may still apply.

The server validates Host/Origin, uses a per-server mutation token, bounds input and output, and renders replies as text. It is a local trusted-user tool, not a hosted multi-user service. Terms need operator review before any public service deployment.

Protocol references: [Codex app server](https://learn.chatgpt.com/docs/app-server) and the installed Cursor CLI's --output-format / --stream-partial-output help. Only assistant text deltas enter the live draft; reasoning and tool events are excluded. Drafts do not enter speech, export or the next participant's context. Completed output remains authoritative.

