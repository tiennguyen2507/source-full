#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   export DOMAIN="example.com"
#   export EMAIL="admin@example.com"
#   export PROJECT_ROOT="/opt/source-full"               # optional
#   export GIT_REPO_URL="https://github.com/u/r.git"     # optional if repo already exists
#   export BRANCH="main"                                 # optional
#   ./vps/deploy.sh

DOMAIN="${DOMAIN:-}"
EMAIL="${EMAIL:-}"
PROJECT_ROOT="${PROJECT_ROOT:-/opt/source-full}"
GIT_REPO_URL="${GIT_REPO_URL:-}"
BRANCH="${BRANCH:-main}"

if [[ -z "${DOMAIN}" || -z "${EMAIL}" ]]; then
  echo "Missing DOMAIN/EMAIL."
  echo "Example:"
  echo "  export DOMAIN='example.com'"
  echo "  export EMAIL='admin@example.com'"
  exit 1
fi

echo "==> Updating apt packages..."
sudo apt-get update -y

echo "==> Installing required packages (git, nginx, certbot)..."
sudo apt-get install -y git ca-certificates curl gnupg nginx certbot python3-certbot-nginx

if ! command -v docker >/dev/null 2>&1; then
  echo "==> Installing Docker Engine + compose plugin..."
  sudo install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" | \
    sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

  sudo apt-get update -y
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi

echo "==> Ensuring current user can run docker (may require re-login)..."
if ! groups "$USER" | grep -q docker; then
  sudo usermod -aG docker "$USER" || true
fi

echo "==> Fetching source..."
if [[ -d "${PROJECT_ROOT}/.git" ]]; then
  cd "${PROJECT_ROOT}"
  git fetch origin "${BRANCH}"
  git checkout "${BRANCH}"
  git pull origin "${BRANCH}"
else
  if [[ -z "${GIT_REPO_URL}" ]]; then
    echo "PROJECT_ROOT doesn't contain a git repo and GIT_REPO_URL is empty."
    echo "Set GIT_REPO_URL='https://github.com/<org>/<repo>.git' then re-run."
    exit 1
  fi
  sudo mkdir -p "${PROJECT_ROOT}"
  sudo chown -R "$USER":"$USER" "${PROJECT_ROOT}"
  git clone "${GIT_REPO_URL}" "${PROJECT_ROOT}"
  cd "${PROJECT_ROOT}"
  git checkout "${BRANCH}"
fi

echo "==> Writing nginx site config for ${DOMAIN}..."
NGINX_SITE_PATH="/etc/nginx/sites-available/source-full"
sudo tee "${NGINX_SITE_PATH}" > /dev/null <<EOF
server {
  listen 80;
  server_name ${DOMAIN};

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }
}
EOF

sudo ln -sf "${NGINX_SITE_PATH}" /etc/nginx/sites-enabled/source-full
sudo rm -f /etc/nginx/sites-enabled/default || true
sudo nginx -t
sudo systemctl reload nginx

echo "==> Starting app with docker compose (production)..."
cd "${PROJECT_ROOT}"
export DOMAIN
docker compose -f docker-compose.prod.yml up -d --build

echo "==> Obtaining/renewing TLS certificate with Let's Encrypt..."
sudo certbot --nginx -d "${DOMAIN}" --non-interactive --agree-tos -m "${EMAIL}" --redirect

echo
echo "✅ Done."
echo "   Web: https://${DOMAIN}"
echo "   Local upstream: http://127.0.0.1:3000"
