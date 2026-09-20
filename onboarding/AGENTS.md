# 0th-hermes
Zero To Hero Hermes: the shortest path to a working Hermes Agent, plus `0th`, a POSIX shell script that prints the one next step. Unofficial. Live: https://0th-hermes.technoir.cloud (README rendered).

## Commands
- Check (before every commit and deploy): `./check.sh` (CI also runs `sh -n` and `shellcheck -s sh 0th check.sh`)
- Deploy the page: `./scripts/deploy.sh`

## Non-negotiables
1. `0th` never reimplements the installer: it shells out to the official `install.sh` and otherwise only reads state; `check.sh` enforces this.
2. `0th` stays one self-contained POSIX `sh` file, runnable after a plain download.
3. The official Hermes docs win: re-check every command against them before changing the README.
4. The ten-minute path stays four steps; everything else goes under "What to ignore, for now".
