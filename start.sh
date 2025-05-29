#!/bin/sh
set -e # Exit on error

echo "Starting Node.js backend server on port 5000..."
node /app/dist/index.js & # Start backend in background

sleep 3 # Optional: Give backend a moment to initialize

echo "Starting Caddy server on $PORT, proxying to backend..."
caddy run --config /app/Caddyfile --adapter caddyfile # Start Caddy in foreground 