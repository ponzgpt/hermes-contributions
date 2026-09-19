# hermes-pkm-toolkit
Skills and a local stdio MCP server that let Hermes Agent and OpenClaw work on Markdown/Obsidian vaults (GTD, PARA, Johnny.Decimal). A toolkit, not an app. Live: https://hermes-pkm-toolkit.technoir.cloud (README rendered).

## Commands
- Check (before every commit and deploy): `.venv/bin/python -m unittest discover -s tests` (setup: `python3 -m venv .venv && .venv/bin/pip install -r requirements.txt`)
- Deploy the page: `./scripts/deploy.sh`

## Non-negotiables
1. Skills are instructions only; Python only does vault I/O, delta tracking and deterministic validation (`jd_index.py`), never PKM judgement.
2. The filesystem is the database: no SQL, no REST, no state outside the vault except `.hermes/delta_tracker.json`.
3. Nothing moves, overwrites or deletes vault notes; structural changes are proposals a human approves.
4. `mcp` stays `<2.0` until `hermes_mcp_server.py` moves off `FastMCP`.
5. Every skill lives in `skills/<hyphen-case>/SKILL.md` and is listed in `skills.sh.json`.
