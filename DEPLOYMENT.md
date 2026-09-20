# Deployment

**Production:** https://hermes-contributions.technoir.cloud — Hostinger VPS (`ssh hoid`), Swarm service `hermes-contributions` on `dokploy-network`, Traefik route `/etc/dokploy/traefik/dynamic/hermes-contributions.yml`, Let's Encrypt. The image builds `dist/` with Node and serves it with `nginx:1.27-alpine`.

```bash
./scripts/deploy.sh                                     # check, build <sha> on the VPS, roll out, wait for /healthz
ssh hoid docker service rollback hermes-contributions   # undo
```

`scripts/deploy.sh` refuses a dirty tree, runs `./scripts/check.sh` first — which includes the upstream freshness check — and keeps the current and previous build on the VPS.

## The four retired hosts

`0th-hermes`, `hermes-agent`, `launch` and `hermes-pkm-toolkit` under `technoir.cloud` are 301 redirects to the matching path here, served by Traefik with no container behind them (`noop@internal`). They are written by `scripts/redirects.sh`, which is idempotent.

| Old                                 | New             |
| ----------------------------------- | --------------- |
| `0th-hermes.technoir.cloud`         | `/onboarding/`  |
| `hermes-agent.technoir.cloud`       | `/`             |
| `launch.technoir.cloud`             | `/field-guide/` |
| `hermes-pkm-toolkit.technoir.cloud` | `/pkm-toolkit/` |

`*.technoir.cloud` is wildcard DNS: there is no DNS record to create or remove for any of this.

## The install URL that cannot move

`https://raw.githubusercontent.com/ponzgpt/0th-hermes/main/0th` is served by GitHub from the archived repository and keeps working as long as that repository is neither deleted nor renamed. The maintained copy is deployed here at `/0th`, on a domain this repo controls, so the next move breaks nobody.
