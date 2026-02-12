#!/bin/bash

# NPM Setup Script for blog.gatslee.com
# Use this if you already have Nginx Proxy Manager running

set -e

echo "=========================================="
echo "Blog Setup with Nginx Proxy Manager"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then
   echo -e "${RED}Please do not run as root${NC}"
   exit 1
fi

echo -e "${YELLOW}Checking prerequisites...${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed${NC}"
    exit 1
fi

# Check if NPM network exists
if ! docker network ls | grep -q "proxy-net"; then
    echo -e "${RED}NPM network 'proxy-net' not found${NC}"
    echo "Please ensure Nginx Proxy Manager is running"
    exit 1
fi

echo -e "${GREEN}✓ Docker is installed${NC}"
echo -e "${GREEN}✓ NPM network detected${NC}"
echo ""

# Get server IP
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || echo "Unable to detect")
echo -e "Your server's public IP: ${GREEN}$SERVER_IP${NC}"
echo ""

# DNS Check
echo -e "${YELLOW}Step 1: DNS Configuration${NC}"
echo "Have you created an A record for blog.gatslee.com?"
echo "  Type: A"
echo "  Name: blog"
echo "  Value: $SERVER_IP"
echo ""
read -p "DNS configured? (y/n): " dns_configured

if [ "$dns_configured" != "y" ]; then
    echo -e "${YELLOW}Please configure DNS first, then run this script again.${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}Step 2: Environment Configuration${NC}"

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env

    # Generate JWT secret
    JWT_SECRET=$(openssl rand -base64 32)
    sed -i "s/change-this-to-a-random-string-min-32-chars/$JWT_SECRET/g" .env
    echo -e "${GREEN}✓ Generated JWT secret${NC}"

    # Prompt for admin password
    read -sp "Enter admin password (leave empty to keep default): " admin_password
    echo ""
    if [ ! -z "$admin_password" ]; then
        sed -i "s/change-this-to-a-strong-password/$admin_password/g" .env
        echo -e "${GREEN}✓ Admin password set${NC}"
    fi
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

echo ""
echo -e "${YELLOW}Step 3: Stopping any existing blog containers${NC}"
docker compose down 2>/dev/null || true
docker compose -f docker-compose.prod.yml down 2>/dev/null || true
echo -e "${GREEN}✓ Cleaned up existing containers${NC}"

echo ""
echo -e "${YELLOW}Step 4: Building and starting blog${NC}"
docker compose -f docker-compose.npm.yml build blog
docker compose -f docker-compose.npm.yml up -d

echo ""
echo -e "${GREEN}✓ Blog container started${NC}"

# Verify blog is on proxy network
if docker network inspect proxy-net | grep -q "blog"; then
    echo -e "${GREEN}✓ Blog connected to NPM network${NC}"
else
    echo -e "${RED}Warning: Blog may not be connected to proxy-net${NC}"
fi

echo ""
echo -e "${GREEN}=========================================="
echo "Blog Container Ready!"
echo "==========================================${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. Open Nginx Proxy Manager (usually at port 81)"
echo ""
echo "2. Add Proxy Host with these settings:"
echo "   ${YELLOW}Domain Names:${NC} blog.gatslee.com"
echo "   ${YELLOW}Scheme:${NC} http"
echo "   ${YELLOW}Forward Hostname:${NC} blog"
echo "   ${YELLOW}Forward Port:${NC} 3001"
echo "   ${YELLOW}SSL:${NC} Request new certificate"
echo "   ${YELLOW}Force SSL:${NC} Yes"
echo ""
echo "3. Wait 30-60 seconds for SSL certificate"
echo ""
echo "4. Visit: ${GREEN}https://blog.gatslee.com${NC}"
echo ""
echo "For detailed instructions, see: ${YELLOW}NPM_SETUP_GUIDE.md${NC}"
echo ""
