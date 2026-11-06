#!/usr/bin/env bash
# Uploads the API to the EC2 box and restarts it. Run from the repository root:
#   ./server/deploy/deploy.sh
# The server keeps its own .env; uploads are merged (never deleted remotely).
set -euo pipefail

KEY="${SSH_KEY:-$HOME/.ssh/osm-win146.pem}"
HOST="${DEPLOY_HOST:-ubuntu@ec2-13-53-92-120.eu-north-1.compute.amazonaws.com}"
DIR="${DEPLOY_DIR:-/home/ubuntu/safin-backend}"
SSH="ssh -i $KEY"

cd "$(dirname "$0")/.."

echo "→ syncing code to $HOST:$DIR"
rsync -az --delete -e "$SSH" \
  --exclude node_modules --exclude .env --exclude 'seed/admins.json' --exclude uploads --exclude deploy \
  ./ "$HOST:$DIR/"

echo "→ syncing uploads (additive)"
rsync -az -e "$SSH" uploads/ "$HOST:$DIR/uploads/"

echo "→ installing dependencies and restarting"
$SSH "$HOST" "cd $DIR && npm ci --omit=dev --no-audit --no-fund && sudo systemctl restart safin && sleep 3 && systemctl is-active safin && curl -fsS http://127.0.0.1:5000/api/health"
echo
echo "✓ deployed"
