# hermes-agent-site

Unofficial landing page for Nous Research's Hermes Agent that behaves like the CLI (slash palette, skins). Static, no build step. Live: https://hermes-agent.technoir.cloud

## Commands

- Check (before every commit and deploy): `npm run check`
- Dev: `npm run dev`
- Deploy: `./scripts/deploy.sh`

## Non-negotiables

1. Every claim, label and number comes from the Hermes docs, CLI reference or README; nothing invented.
2. Every text role in every skin keeps 4.5:1 contrast (`tests/contrast.test.js`).
3. `index.html` stays readable and complete without JavaScript.
4. State it is not affiliated with Nous Research.
