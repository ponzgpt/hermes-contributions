---
name: hermes-pkm
description: Operate a local Markdown PKM vault through MCP, delta tracking, GTD, PARA, and Johnny.Decimal.
version: 0.1.0
metadata:
  hermes:
    tags: [pkm, markdown, mcp, local-first]
    category: knowledge
    requires_toolsets: [terminal]
  openclaw:
    always: true
    requires:
      bins: [python3]
---
# Hermes PKM

## When To Use

Use this skill when the user wants an agent to operate a local Markdown or Obsidian vault with reviewable, local-first actions.

## Procedure

1. Confirm the vault root is available as `HERMES_VAULT_ROOT`.
2. Start or connect to the MCP server in `00_CORE/hermes_mcp_server.py`.
3. Run `00_CORE/delta_tracker.py` at session start to identify changed `.md` files.
4. Load only the protocol skills needed for the current task:
   - `johnny-decimal-router`
   - `gtd-capture`
   - `para-router`
5. Read before writing.
6. Prefer append-only capture when intent is unclear.
7. Present a plan before moving, renaming, archiving, or restructuring notes.

## MCP Tools Expected

- `list_resources`: inspect Markdown files.
- `read_resource`: read a Markdown file.
- `append_to_file`: append Markdown safely.
- `create_file`: create a new Markdown file without overwriting.

## Pitfalls

- Do not treat the vault as a database migration target.
- Do not invent permanent folder schemes without approval.
- Do not delete or overwrite user notes.
- Do not load all protocol skills when one is enough.

## Verification

A successful run leaves clear Markdown diffs, no hidden database state, and a concise summary of paths read or changed.
