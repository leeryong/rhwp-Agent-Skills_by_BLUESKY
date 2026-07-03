# rhwp Agent Skills

<div align="right">

[한국어](README.md) | **English**

</div>

A collection that skillifies [rhwp](https://github.com/edwardkim/rhwp) — a Rust/WebAssembly-based HWP/HWPX viewer/editor — so AI agents can handle it.

<p align="center">
  <img src="docs/rhwp-agent-lab.png" alt="A handwritten document (left) recognized by the agent and authored with rhwp skills (right)" width="900">
</p>

<p align="center"><sub>
On the left is a handwritten source; on the right is the result of the agent recognizing that document and authoring it with rhwp skills.
</sub></p>

> 🚧 **Work in progress** — `rhwp Agent Skills` is being cleaned up for release, and **rhwp-Agent** (an imitative, conversational document-authoring agent that recognizes and writes handwritten documents) running on top of these skills is being **trained and developed privately**.

---

## 🆕 Latest News

> ### 🌐 Now on **TAW** — meet it as an agent!
>
> **rhwp Agent Skills** has joined **[The Agents Web (TAW)](https://github.com/leeryong/The_Agents_Web_TAW/blob/main/README.md)** as an **agent**. No install needed — with a single **TAW Browser**, meet it **anywhere on PC or mobile** (Windows · macOS · Linux · iOS · Android), via **chat or its web app**.
>
> ➡️ **[The Agents Web (TAW)](https://github.com/leeryong/The_Agents_Web_TAW/blob/main/README.md)** · 🌌 **[KISTI · BLUESKY](https://github.com/leeryong/KISTI_BLUESKY)**


## 🔎 Overview

Korean documents (HWP/HWPX) are widely used in Korea but tricky to handle programmatically. rhwp is a project that parses and renders them in Rust and builds them with WebAssembly, implementing an in-browser HWP editor (`rhwp-studio`).

rhwp Agent Skills organizes this `rhwp-studio` so that an AI agent — not a human — can operate and verify it.

Building on these skills, we are developing a system in which humans and agents write documents together. As shown above, the agent recognizes a handwritten source and authors it as a document using rhwp skills, and we are training an agent that writes documents this way. However, this repository does not disclose the specifics of that system or agent — it publishes **only the part that skillifies rhwp**.

## 🧩 Skill Overview

The `rhwp-gui-agent` skill helps agents operate, verify, and extend `rhwp-studio` at the GUI level. Roughly, it covers:

- Launching the editor, creating new documents, opening/saving HWP/HWPX
- Applying character/paragraph/table/shape formatting by directly operating menus, toolboxes, the formatting toolbar, and dialogs
- Inspecting document state and verifying export results via the `?agent=1` automation bridge
- A feature-map reference organizing menus, tools, dialogs, and `hwpctl` actions
- A GUI smoke-test script

Detailed procedures are documented in [`skills/rhwp-gui-agent/SKILL.md`](skills/rhwp-gui-agent/SKILL.md) and [`references/feature-map.md`](skills/rhwp-gui-agent/references/feature-map.md).

The `?agent=1` automation bridge (`window.__rhwpAgent`) is a modification not present in upstream rhwp, so it is provided in [`bridge/`](skills/rhwp-gui-agent/bridge/) together with snippets, smoke tests, and integration guidance.

## 🚀 Usage

These skills are used together with the [rhwp](https://github.com/edwardkim/rhwp) repository.

1. Get the rhwp repository, build the WASM, and launch `rhwp-studio`.
2. **Apply the agent-mode bridge** — since upstream rhwp has no `?agent=1` bridge, follow the guidance in [`skills/rhwp-gui-agent/bridge/`](skills/rhwp-gui-agent/bridge/) to add the bridge (`window.__rhwpAgent`) and smoke tests to `rhwp-studio`.
3. Open it in the browser in `?agent=1` mode. Outside this mode, the bridge is not exposed.
4. Register `skills/rhwp-gui-agent/SKILL.md` with an agent tool that reads skills, and the agent will operate the GUI directly to perform and verify document work.

For build/launch commands, selectors, and APIs, see [`SKILL.md`](skills/rhwp-gui-agent/SKILL.md).

## 🙏 Respect

- This work builds on [**rhwp**](https://github.com/edwardkim/rhwp)'s Rust+WASM Korean-document parser/renderer. It would have been impossible without the rhwp project, and we are deeply grateful for that effort.
- We pay our respects to [**Hancom**](https://www.hancom.com/), which has built the HWP/HWPX format and the Korean word-processor ecosystem. This work is not meant to replace Hancom's products, but is an attempt to help Korean documents be handled well in the age of AI.

## 📞 Contact

- Ryong Lee (ryonglee@kisti.re.kr)

## 👨‍💻 Development Team

KISTI **BLUESKY** Team — *Harmonizing Human and AI Collaboration* · [github.com/leeryong/KISTI_BLUESKY](https://github.com/leeryong/KISTI_BLUESKY)

- Ryong Lee (ryonglee@kisti.re.kr)
- Raeyoung Jang (raezero@kisti.re.kr)
- Jahyun Gu (jahyeongu@kisti.re.kr)

## 📚 Open-Source Acknowledgements

- [rhwp](https://github.com/edwardkim/rhwp) — Rust/WASM-based HWP/HWPX viewer/editor
