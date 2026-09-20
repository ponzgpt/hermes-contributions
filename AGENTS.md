# hermes-contributions
Everything Javier built around Hermes Agent, in one place, offered back to the project as a heavy user's contribution. Unaffiliated with Nous Research. Live: https://hermes-contributions.technoir.cloud (pending first deploy)

## Commands
- Check (before every commit and deploy): `./scripts/check.sh`
- Deploy: `./scripts/deploy.sh` (pending: written when the first part lands)

## Migration state
Four repos fold in here: `0th-hermes` → `onboarding/`, `hermes-agent-site` → `page/`, `hermes-launch` → `field-guide/`, `hermes-pkm-toolkit` → `pkm-toolkit/`. Each source repo stays live and authoritative until its part lands here and its host 301s. Bring history with `git subtree`, not a copy. Archive the source repo on GitHub — never delete it.

`0th-hermes` publishes a raw install URL that people may have piped to a shell. That URL keeps working or the move is a breaking change; settle how before moving that part.

## Non-negotiables
1. Never claim affiliation, endorsement or a contribution to Hermes Agent's own code. The page says so in its own words, not in fine print.
2. Anything quoted from upstream — version numbers, install commands, model names, prices — is checked by `scripts/check.sh` against what Nous currently publishes. Three of the four source pages rotted silently; this one fails loudly instead.
3. Every claim about Javier must be in the claims ledger (private `ponzgpt/javier-ponz-site-internal`).
4. One service, one host: adding a part does not add a domain. The retired hosts redirect here.
