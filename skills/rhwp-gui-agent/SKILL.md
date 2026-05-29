---
name: rhwp-gui-agent
description: Control, test, and extend the rhwp web HWP/HWPX editor through its browser GUI and agent automation bridge. Use when an AI agent needs to run rhwp-studio, open or create HWP/HWPX files, exercise menus/toolbars/dialogs, verify document editing features, automate GUI operations with Puppeteer/CDP, use the hwpctl compatibility layer, or analyze rhwp commands, menus, and editor capabilities.
---

# rhwp GUI Agent

Use this skill to operate `rhwp-studio` as both a human-facing web editor and an agent-controllable GUI. Prefer real GUI actions for feature checks; use the `?agent=1` bridge only for readiness, state inspection, sample loading, and export verification.

## Quick Start

From the rhwp repository root:

```bash
cp .env.docker.example .env.docker
docker compose --env-file .env.docker run --rm wasm
cd rhwp-studio
npm ci
npm run build
python3 -m http.server 8765 --bind 0.0.0.0 -d dist
```

Open `http://127.0.0.1:8765/?agent=1`. Without `?agent=1`, the editor works for users but does not expose the automation bridge.

## Core Workflow

1. Build `pkg/rhwp.js` and `pkg/rhwp_bg.wasm` before running Studio. If `npm run build` reports `Cannot find module '@wasm/rhwp.js'`, the WASM package has not been built.
2. Serve the built app or run Vite. Use `python3 -m http.server ... -d dist` when Vite cannot bind ports in a sandbox.
3. Launch a browser automation session against `/?agent=1`.
4. Use GUI selectors for actions:
   - Menus: `#menu-bar .menu-item[data-menu="<menu>"] .menu-title`
   - Menu commands: `[data-cmd="<command-id>"]`
   - Toolbar buttons: `.tb-btn[data-cmd="<command-id>"]`
   - Style bar controls: `#style-name`, `#font-lang`, `#font-name`, `#font-size`, `#btn-bold`, `#btn-italic`, `#btn-underline`, `#btn-strike`, `#btn-text-color`, `#btn-highlight`, alignment buttons, and `#linespacing-select`
   - File input: `#file-input`
   - Canvas editor: `#scroll-container canvas`
5. Use `window.__rhwpAgent` for observation:
   - `ready()`
   - `context()`
   - `commands()`
   - `pageCount()`
   - `fileName()`
   - `loadSample(path)`
   - `loadBytes(bytes, fileName)`
   - `createNewDocument()`
   - `exportHwp()`, `exportHwpx()`
6. Capture screenshots and exported files after every feature cluster. Treat failed clicks, disabled commands, console errors, and blank canvases as test failures.

## Feature Coverage

Read `references/feature-map.md` when enumerating or testing all GUI features. It maps the top-level menus, command IDs, dialogs, toolbar controls, and hwpctl actions.

For an automated smoke run, use:

```bash
cd rhwp-studio
node e2e/agent-gui-full-smoke.mjs
```

If browser launch is blocked by the environment, still run:

```bash
npm run build
```

Then review `e2e/agent-gui-full-smoke.mjs` and run it in a browser-enabled environment.

## Test Strategy

Use three layers:

1. Build validation: `docker compose --env-file .env.docker run --rm wasm`, then `npm run build`.
2. GUI smoke: create a new document, type text, toggle character/paragraph formatting, create a table, open the shape picker, open the symbol dialog, load `.hwp` and `.hwpx` samples, save/download `.hwp`, and capture screenshots.
3. Deep checks: run existing `rhwp-studio/e2e/*.mjs` tests and hwpctl scenarios when a real browser is available.

Prefer built-in samples first:

```text
public/samples/basic/KTX.hwp
public/samples/form-002.hwpx
public/samples/BlogForm_BookReview.hwp
public/samples/biz_plan.hwp
public/samples/field-01.hwp
public/samples/footnote-01.hwp
public/samples/number-bullet.hwp
```

When downloading public HWP/HWPX samples, save them under `rhwp-studio/public/samples/external/`, verify the file signature before loading, and record source URL, filename, byte size, and load result.

## Agent Bridge Rules

Use the bridge to observe state and load repeatable test fixtures, not to bypass GUI coverage. For a feature claim like “table creation works,” click the toolbar/menu and dialog. For a claim like “the document has loaded,” `window.__rhwpAgent.pageCount()` is appropriate.

Do not assume a command is implemented just because it appears in HTML. Cross-check with `src/command/commands/*.ts`; some menu items are placeholders or disabled depending on context.

## Common Failures

- `listen EPERM`: use a static server on an approved port or run outside the sandbox.
- Browser launch failure: run the script where Chrome/Chromium execution is allowed; set `CHROME_PATH` if needed.
- HWPX save disabled: expected for HWPX-source documents in the current beta path.
- `@wasm/rhwp.js` missing: rebuild WASM with Docker.
- File System Access API unavailable in headless Chrome: expect fallback download flow.
