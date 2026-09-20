#!/usr/bin/env bash
# Point the four retired hosts at this one, permanently.
#
# Traefik can 301 with no container behind it (noop@internal), so this removes
# four nginx services rather than replacing them. Idempotent: run it again after
# any Traefik change. See DEPLOYMENT.md.
set -euo pipefail
HOST=${HOST:-hoid}
NEW=${NEW:-hermes-contributions.technoir.cloud}
DYN=/etc/dokploy/traefik/dynamic

# old-host                          path on the new host   retired swarm service
MOVES="
0th-hermes.technoir.cloud           /onboarding/           0th-hermes
hermes-agent.technoir.cloud         /                      hermes-agent-site
launch.technoir.cloud               /field-guide/          hermes-launch
hermes-pkm-toolkit.technoir.cloud   /pkm-toolkit/          hermes-pkm-toolkit
"

echo "$MOVES" | while read -r old path svc; do
  [ -n "${old:-}" ] || continue
  name="redirect-${svc}"
  echo "→ $old → https://$NEW$path"
  ssh "$HOST" bash -s <<REMOTE
set -euo pipefail
cat > $DYN/$name.yml <<YML
# Retired host. Folded into $NEW; see github.com/ponzgpt/hermes-contributions.
http:
  middlewares:
    $name-to-new:
      redirectRegex:
        regex: "^https?://[^/]+/.*"
        replacement: "https://$NEW$path"
        permanent: true
  routers:
    $name-http:
      rule: Host(\\\`$old\\\`)
      service: noop@internal
      middlewares: [$name-to-new]
      entryPoints: [web]
    $name-https:
      rule: Host(\\\`$old\\\`)
      service: noop@internal
      middlewares: [$name-to-new]
      entryPoints: [websecure]
      tls: { certResolver: letsencrypt }
YML
rm -f $DYN/$svc.yml
docker service rm $svc >/dev/null 2>&1 && echo "   retired swarm service $svc" || true
docker images $svc --format '{{.Repository}}:{{.Tag}}' | xargs -r docker rmi >/dev/null 2>&1 || true
rm -rf /opt/$svc
REMOTE
done

echo
for old in 0th-hermes hermes-agent launch hermes-pkm-toolkit; do
  printf '%-40s ' "https://$old.technoir.cloud/"
  curl -s -o /dev/null -w '%{http_code} → %{redirect_url}\n' --max-time 15 "https://$old.technoir.cloud/"
done
