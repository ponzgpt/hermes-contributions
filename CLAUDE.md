# Claude Code Context

This repo is optimized first for Hermes Agent and OpenClaw, while remaining readable by Claude Code and Codex.

Use `AGENTS.md` as the canonical project instructions. The most native skill entry points are under `skills/<slug>/SKILL.md`.

## Conventions

- Keep skills short, procedural, and safe to load into context.
- Keep Python dependency-light and local-only.
- Do not introduce network services except MCP stdio.
- Treat Markdown vault writes as user data operations.
