#!/bin/sh
set -e # Exit on error

echo "Current directory: $(pwd)"
echo "Listing directory contents:"
ls -la

echo "Starting Node.js backend server on port 5000..."
node dist/index.js & # Start backend in background

sleep 3 # Optional: Give backend a moment to initialize

echo "Starting Caddy server on $PORT, proxying to backend..."
caddy run --config Caddyfile --adapter caddyfile # Start Caddy in foreground 