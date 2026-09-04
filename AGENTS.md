# Agent Context: hermes-pkm-toolkit

This repository publishes local-first PKM skills and a tiny MCP server for agents that operate Markdown vaults.

## Primary Runtime Targets

- Hermes Agent by Nous Research: project context via `.hermes.md` or `AGENTS.md`, reusable workflows via `SKILL.md` skills, vault access via MCP.
- OpenClaw by Peter Steinberger: workspace/project skills under `skills/<slug>/SKILL.md`, local-first gateway/workspace assumptions, short skill descriptions.
- Claude Code and Codex: `CLAUDE.md` and `AGENTS.md` provide equivalent repo instructions.

## Repository Contract

- Keep all skill names lowercase hyphen-case.
- Every installable skill lives in `skills/<skill-slug>/SKILL.md`.
- Skills contain instructions only; framework logic must not be hardcoded into Python.
- Python code only exposes local Markdown I/O and delta tracking.
- The local filesystem is the database. No SQL, no NoSQL, no REST service.
- Destructive vault changes require explicit human approval.

## Verification

Run these after code changes:

```bash
python3 -m py_compile 00_CORE/hermes_mcp_server.py 00_CORE/delta_tracker.py
python3 00_CORE/delta_tracker.py /path/to/test-vault
```
