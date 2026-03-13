#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "👉 Moving to project root: ${ROOT_DIR}"
cd "${ROOT_DIR}"

echo "🐳 Building and starting Docker services (frontend + backend)..."
docker compose -f docker-compose.yml up -d --build

echo
echo "✅ Docker services are up."
echo "   - Frontend (Next.js): http://localhost:3000"
echo "   - Backend (NestJS):   http://localhost:3001 (inside Docker network as http://backend:3001)"
echo
echo "Use 'docker compose ps' to see container status."

