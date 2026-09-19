# Deployment

**Production:** https://launch.technoir.cloud: Hostinger VPS (`ssh hoid`), Swarm service `hermes-launch` on `dokploy-network`, Traefik route `/etc/dokploy/traefik/dynamic/hermes-launch.yml`, Let's Encrypt. `nginx:1.27-alpine` serves `index.html`; `/healthz` is a static file.

```bash
./scripts/deploy.sh                                  # check, build <sha> on the VPS, roll out, wait for /healthz
ssh hoid docker service rollback hermes-launch       # undo
```
