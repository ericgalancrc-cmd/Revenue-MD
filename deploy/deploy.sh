#!/bin/bash
# RevenueMD deployment script
# Run from /opt/revenuemd/app after pulling latest code
# Usage: bash deploy/deploy.sh

set -e
echo "=== Deploying RevenueMD API ==="

cd "$(dirname "$0")/.."

echo "Pulling latest code..."
git pull origin main

echo "Rebuilding container..."
docker compose -f docker-compose.prod.yml build api

echo "Restarting services..."
docker compose -f docker-compose.prod.yml up -d

echo "Waiting for health check..."
sleep 5
curl -sf http://localhost:8000/health && echo " API is healthy." || echo " WARNING: health check failed"

echo "=== Deployment complete ==="
