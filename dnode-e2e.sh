#!/bin/sh
# Headless e2e wrapper (SECURITY: still inside Docker, never on the host).
# Builds the Dockerfile.e2e image, starts Xvfb, and runs the given command
# (defaults to the e2e suite). .obsidian-cache is mounted via the repo volume
# so the downloaded Obsidian binaries persist between runs.
# Usage: ./dnode-e2e.sh            (runs npm run test:e2e)
#        ./dnode-e2e.sh <cmd...>
set -e

IMAGE=ofmt-e2e
docker build -f Dockerfile.e2e -t "$IMAGE" .

if [ "$#" -eq 0 ]; then
    set -- npm run test:e2e
fi

exec docker run --rm -i \
    -u "$(id -u):$(id -g)" -e HOME=/tmp \
    --shm-size=1g \
    -w /app -v "$(pwd)":/app \
    "$IMAGE" \
    sh -ec 'Xvfb :99 -screen 0 1280x1024x24 -nolisten tcp >/tmp/xvfb.log 2>&1 & export DISPLAY=:99; sleep 2; exec "$@"' _ "$@"
