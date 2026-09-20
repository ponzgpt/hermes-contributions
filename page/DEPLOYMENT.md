# Deployment

**Production:** https://hermes-agent.technoir.cloud: Hostinger VPS (`ssh hoid`), Swarm service `hermes-agent-site` on `dokploy-network`, Traefik route `/etc/dokploy/traefik/dynamic/hermes-agent-site.yml`, Let's Encrypt. The image is `nginx:1.27-alpine` serving `index.html` and `assets/`.

```bash
./scripts/deploy.sh                                       # check, build <sha> on the VPS, roll out, wait for /healthz
ssh hoid docker service rollback hermes-agent-site        # undo
```
