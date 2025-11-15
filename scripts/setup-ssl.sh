#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  SSL Certificate Setup for secureauth.mannu.live${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Warning: .env file not found. Copying from .env.example${NC}"
    cp .env.example .env
    echo -e "${YELLOW}Please update .env file with your actual values before running the application${NC}"
    echo ""
fi

# Create directories for certbot
echo -e "${GREEN}Creating directories for SSL certificates...${NC}"
mkdir -p infrastructure/docker/certbot/conf
mkdir -p infrastructure/docker/certbot/www

# Check if certificates already exist
if [ -d "infrastructure/docker/certbot/conf/live/secureauth.mannu.live" ]; then
    echo -e "${YELLOW}SSL certificates already exist. Skipping certificate generation.${NC}"
    echo -e "${YELLOW}If you want to regenerate certificates, delete the infrastructure/docker/certbot directory and run this script again.${NC}"
    exit 0
fi

echo -e "${GREEN}Starting nginx for certificate generation...${NC}"
# Start only nginx temporarily
docker-compose -f docker-compose.prod.yml up -d nginx

echo ""
echo -e "${GREEN}Obtaining SSL certificate from Let's Encrypt...${NC}"
echo -e "${YELLOW}Note: Make sure your domain secureauth.mannu.live points to this server's IP address${NC}"
echo ""

# Get the email from .env or prompt
EMAIL=$(grep EMAIL .env | cut -d '=' -f2)
if [ -z "$EMAIL" ]; then
    read -p "Enter your email address for SSL certificate: " EMAIL
fi

# Obtain certificate
docker-compose -f docker-compose.prod.yml run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d secureauth.mannu.live

if [ $? -eq 0 ]; then
    echo -e "${GREEN}SSL certificate obtained successfully!${NC}"
    echo -e "${GREEN}Restarting nginx to use the new certificate...${NC}"
    docker-compose -f docker-compose.prod.yml restart nginx
else
    echo -e "${RED}Failed to obtain SSL certificate.${NC}"
    echo -e "${YELLOW}Please ensure:${NC}"
    echo -e "  1. Your domain secureauth.mannu.live points to this server"
    echo -e "  2. Ports 80 and 443 are open in your firewall"
    echo -e "  3. No other service is using ports 80 or 443"
    exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  SSL Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "You can now start all services with: ${GREEN}docker-compose up -d${NC}"
