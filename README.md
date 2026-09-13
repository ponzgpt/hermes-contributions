# Hermes Launch

Independent Hermes Agent deployment and enablement service by MDIB.

## Local verification

```bash
docker build -t hermes-launch:local .
docker run --rm -d --name hermes-launch-test -p 18080:80 hermes-launch:local
curl -fsS http://127.0.0.1:18080/healthz
curl -fsS http://127.0.0.1:18080/ | grep -q 'Get Hermes running'
docker rm -f hermes-launch-test
```

## Deployment

- Intended host: Hostinger VPS / Dokploy / Traefik
- Intended hostname: `launch.technoir.cloud`
- Container port: `80`
- Health path: `/healthz`
- This is independent consulting, not official Nous Research support.
