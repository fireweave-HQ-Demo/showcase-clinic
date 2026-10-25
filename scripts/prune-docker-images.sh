#!/usr/bin/env bash
# Drop images no container is using so the next docker load has disk.
set -euo pipefail

echo "disk before"
df -h /

# Stopped containers keep old image ids alive. Remove them first.
docker container prune -f

# Dangling layers from earlier loads, and tagged images nothing references.
docker image prune -af

# Build cache from any on-host build. Images above are the disk that fills.
docker builder prune -af || true

echo "disk after"
df -h /
docker system df
