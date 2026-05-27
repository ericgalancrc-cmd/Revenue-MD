#!/bin/bash
# RevenueMD EC2 Bootstrap Script
# Run as root on a fresh Ubuntu 22.04 instance
# Usage: sudo bash setup-ec2.sh

set -e
echo "=== RevenueMD EC2 Setup ==="

# 1. System update
apt-get update -y && apt-get upgrade -y

# 2. Install Docker
apt-get install -y ca-certificates curl gnupg lsb-release
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Start and enable Docker
systemctl start docker
systemctl enable docker

# 3. Install Certbot
apt-get install -y certbot python3-certbot-nginx

# 4. Create app directory
mkdir -p /opt/revenuemd
echo "--- Create your production .env file ---"
echo "Run: nano /opt/revenuemd/.env"
echo "Copy from backend/.env.example and fill in real values."
echo ""

# 5. Set up certbot auto-renewal
echo "0 12 * * * root certbot renew --quiet" >> /etc/crontab

echo ""
echo "=== NEXT STEPS ==="
echo "1. Point api.revenuemdpr.com DNS A record to this server's IP"
echo "2. Create /opt/revenuemd/.env with production values"
echo "3. Clone the repo: git clone <your-repo-url> /opt/revenuemd/app"
echo "4. cd /opt/revenuemd/app && docker compose -f docker-compose.prod.yml up -d"
echo "5. Obtain TLS cert: certbot --nginx -d api.revenuemdpr.com"
echo "6. Test: curl https://api.revenuemdpr.com/health"
echo ""
echo "=== Setup complete ==="
