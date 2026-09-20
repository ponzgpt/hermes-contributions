# hermes-pkm-toolkit

Native skills and MCP primitives for agents that operate local Markdown/Obsidian PKM vaults.

This repository does not replace Hermes Agent or OpenClaw. It gives them a small, installable operating layer for personal knowledge management: safe Markdown file access, delta tracking, and protocol skills for GTD, PARA, and Johnny.Decimal.

The database is the local filesystem. Git is the audit trail. Markdown is the interface.

## Install

```bash
hermes skills install ponzgpt/hermes-pkm-toolkit/skills/hermes-pkm   # plus gtd-capture, para-router, johnny-decimal-router
```

Then add the vault MCP server (below) so the skills can read and append to your notes.

## Compatibility Targets

- Hermes Agent by Nous Research: `.hermes.md`, `AGENTS.md`, MCP stdio server, and `SKILL.md` skills.
- OpenClaw by Peter Steinberger: `skills/<slug>/SKILL.md` workspace/project skills with short descriptions and hyphen-case names.
- Claude Code and Codex: `AGENTS.md` and `.mcp.json`.

## Native Entry Points

```text
AGENTS.md                         Shared agent instructions
.hermes.md                        Hermes-native project context
.mcp.json                         MCP server example for compatible clients
skills.sh.json                    Skill grouping metadata
skills/
  hermes-pkm/SKILL.md             Main PKM operating skill
  gtd-capture/SKILL.md            GTD inbox and task capture
  para-router/SKILL.md            PARA routing workflow
  johnny-decimal-router/SKILL.md  Johnny.Decimal routing workflow
00_CORE/
  hermes_mcp_server.py            Local stdio MCP server for Markdown vaults
  delta_tracker.py                Hash/timestamp delta tracking for `.md` files
```

Legacy human guides and protocol notes remain under `01_JOHNNY_DECIMAL`, `02_GTD`, and `03_PARA`.

## Requirements

- Python 3.10+ (the `mcp` package does not publish wheels for 3.9 or earlier).
- Dependencies are pinned in `requirements.txt` (`mcp<2.0` — the 2.x line renamed
  `FastMCP`, which this server does not yet use).

## Setup For Hermes Agent

Hermes supports project context files and external skill directories. From a local clone:

```bash
export HERMES_VAULT_ROOT="$HOME/Documents/MyVault"
python3 -m pip install -r requirements.txt
python3 00_CORE/hermes_mcp_server.py
```

Recommended Hermes config shape:

```yaml
mcp_servers:
  hermes-pkm-vault:
    command: "python3"
    args: ["/absolute/path/hermes-pkm-toolkit/00_CORE/hermes_mcp_server.py"]
    env:
      HERMES_VAULT_ROOT: "/absolute/path/to/vault"

skills:
  external_dirs:
    - /absolute/path/hermes-pkm-toolkit/skills
```

Then invoke `/hermes-pkm` or let Hermes select the skill naturally.

## Setup For OpenClaw

OpenClaw loads workspace skills from `<workspace>/skills` and project/personal skill roots. Copy or symlink the skill directories:

```bash
mkdir -p ~/.openclaw/workspace/skills
ln -s /absolute/path/hermes-pkm-toolkit/skills/hermes-pkm ~/.openclaw/workspace/skills/hermes-pkm
ln -s /absolute/path/hermes-pkm-toolkit/skills/gtd-capture ~/.openclaw/workspace/skills/gtd-capture
ln -s /absolute/path/hermes-pkm-toolkit/skills/para-router ~/.openclaw/workspace/skills/para-router
ln -s /absolute/path/hermes-pkm-toolkit/skills/johnny-decimal-router ~/.openclaw/workspace/skills/johnny-decimal-router
openclaw skills list
```

Use `openclaw gateway restart` or start a new session if the skills watcher has not refreshed.

## MCP Tools

`00_CORE/hermes_mcp_server.py` exposes:

- `list_resources`: list Markdown files in the vault.
- `read_resource`: read a Markdown file.
- `append_to_file`: append Markdown safely.
- `create_file`: create a new Markdown file without overwriting.

All paths are relative to `HERMES_VAULT_ROOT`. The server blocks path traversal and rejects non-Markdown writes.

## Johnny.Decimal Index Generator

Define your areas and categories once, preview the folders, then create them. It validates ranges (`10`–`90`), keeps every category inside its area, rejects duplicate IDs and makes labels filesystem-safe. It only creates missing folders; it never moves or deletes anything.

```json
{"areas": [{"range": 10, "name": "Life admin",
            "categories": [{"id": 11, "name": "Finance"}, {"id": 12, "name": "Health"}]}]}
```

```bash
python3 00_CORE/jd_index.py jd.json                          # preview
python3 00_CORE/jd_index.py jd.json --write "$HERMES_VAULT_ROOT"   # create
```

Ask Hermes to run the preview and show it to you before `--write`; the `johnny-decimal-router` skill then routes notes into those folders.

## Delta Tracking

```bash
python3 00_CORE/delta_tracker.py "$HERMES_VAULT_ROOT"
```

This writes:

```text
<vault>/.hermes/delta_tracker.json
```

The tracker compares `sha256`, `mtime_ns`, and `size` for every `.md` file and reports `added`, `modified`, `deleted`, and `unchanged_count`.

## Safety Model

- No SQL or NoSQL.
- No REST API.
- No hidden state outside the vault except `.hermes/delta_tracker.json`.
- No overwrite through `create_file`.
- No delete tool.
- No move tool in the MCP core.
- Structural vault changes require human approval.

## License

MIT.
