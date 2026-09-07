#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "[deploy] Building image..."
docker compose build blog

echo "[deploy] Stopping containers..."
docker compose down

echo "[deploy] Starting containers..."
docker compose up -d

echo "[deploy] Ensuring blog is on proxy-net..."
docker network connect proxy-net blog 2>/dev/null || echo "[deploy] Already on proxy-net"

echo "[deploy] Waiting for blog to be ready..."
for i in $(seq 1 15); do
  if curl -s http://localhost:3001 -o /dev/null -w "%{http_code}" --max-time 2 | grep -q "200"; then
    echo "[deploy] Blog is up on localhost:3001"
    break
  fi
  echo "[deploy] Waiting... ($i/15)"
  sleep 2
done

# Verify NPM → blog connectivity
echo "[deploy] Checking NPM → blog..."
if docker exec infra-npm curl -s http://blog:3001 -o /dev/null -w "%{http_code}" --max-time 3 2>/dev/null | grep -q "200"; then
  echo "[deploy] ✓ blog.gatslee.com is live"
else
  echo "[deploy] Restarting NPM for DNS refresh..."
  docker restart infra-npm
  sleep 3
  if docker exec infra-npm curl -s http://blog:3001 -o /dev/null -w "%{http_code}" --max-time 3 2>/dev/null | grep -q "200"; then
    echo "[deploy] ✓ blog.gatslee.com is live (after NPM restart)"
  else
    echo "[deploy] ✗ FAILED — manual check needed"
    docker inspect blog --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}'
    exit 1
  fi
fi

echo "[deploy] ✓ Done."
