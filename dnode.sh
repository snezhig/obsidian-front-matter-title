#!/bin/sh
# Non-interactive Docker wrapper for node/npm.
# SECURITY: node/npm must NEVER run directly on the host — only inside this
# disposable, pinned container, so malicious postinstall scripts are sandboxed.
# Usage: ./dnode.sh npm install | npm run build | npm run test | npm run dev | ...
# HOME=/tmp keeps npm's cache writable for the arbitrary host uid (the image
# user's home is not owned by it, which would break npm install).
exec docker run --rm -i -u "$(id -u):$(id -g)" -e HOME=/tmp -w /app -v "$(pwd)":/app node:20 "$@"
