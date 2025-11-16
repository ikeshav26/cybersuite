#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  CyberSec Platform - Production Deployment${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    echo "Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed${NC}"
    echo "Please install Docker Compose first: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✓ Docker and Docker Compose are installed${NC}"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file from .env.example...${NC}"
    cp .env.example .env
    echo -e "${RED}ERROR: Please update the .env file with your actual values:${NC}"
    echo -e "  - JWT_SECRET"
    echo -e "  - OPENAI_API_KEY"
    echo -e "  - ANTHROPIC_API_KEY"
    echo -e "  - GEMINI_API_KEY"
    echo -e "  - GITHUB_APP_ID, GITHUB_PRIVATE_KEY, GITHUB_WEBHOOK_SECRET"
    echo -e "  - EMAIL (for SSL certificate)"
    echo -e "  - GITHUB_REPOSITORY_OWNER (your GitHub username in lowercase)"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ Environment configuration ready${NC}"
echo ""

# Load environment variables
source .env

echo -e "${BLUE}Building all services locally...${NC}"
docker-compose -f docker-compose.yml build --parallel

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to build images. Please check the build logs above.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ Images built successfully${NC}"
echo ""

# Start infrastructure services first
echo -e "${BLUE}Starting infrastructure services (PostgreSQL, Redis, MinIO)...${NC}"
docker-compose -f docker-compose.yml up -d postgres redis minio

echo ""
echo -e "${YELLOW}Waiting for databases to be ready...${NC}"
sleep 15

# Run database migrations
echo -e "${BLUE}Running database migrations...${NC}"
docker-compose -f docker-compose.yml run --rm auth-service sh -c "npx prisma db push --skip-generate" 2>/dev/null || echo -e "${YELLOW}Note: Migration step may require manual setup${NC}"

echo ""
echo -e "${GREEN}✓ Infrastructure services are ready${NC}"
echo ""

# Ask about SSL setup if certificates don't exist
if [ ! -d "infrastructure/docker/certbot/conf/live/secureauth.mannu.live" ]; then
    echo -e "${YELLOW}SSL certificates not found.${NC}"
    echo -e "This requires:"
    echo -e "  1. Domain secureauth.mannu.live pointing to this server"
    echo -e "  2. Ports 80 and 443 accessible from the internet"
    echo ""
    read -p "Set up SSL certificates now? (y/N): " -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        chmod +x scripts/setup-ssl.sh
        ./scripts/setup-ssl.sh
        if [ $? -ne 0 ]; then
            echo -e "${RED}SSL setup failed. You can run it later with: ./scripts/setup-ssl.sh${NC}"
            echo -e "${YELLOW}Continuing without SSL...${NC}"
        fi
    fi
fi

# Start all services
echo ""
echo -e "${BLUE}Starting all services...${NC}"
docker-compose -f docker-compose.yml up -d

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Services are starting. Check their status with:"
echo -e "  ${GREEN}docker-compose -f docker-compose.yml ps${NC}"
echo ""
echo -e "View logs with:"
echo -e "  ${GREEN}docker-compose -f docker-compose.yml logs -f [service-name]${NC}"
echo ""
echo -e "Access the application at:"
echo -e "  ${GREEN}https://secureauth.mannu.live${NC} (if SSL is configured)"
echo -e "  ${GREEN}http://localhost${NC} (local access)"
echo ""
echo -e "Service endpoints:"
echo -e "  - Web App: ${BLUE}https://secureauth.mannu.live${NC}"
echo -e "  - Auth API: ${BLUE}https://secureauth.mannu.live/api/auth${NC}"
echo -e "  - AI API: ${BLUE}https://secureauth.mannu.live/api/ai${NC}"
echo -e "  - Securebot API: ${BLUE}https://secureauth.mannu.live/api/securebot${NC}"
echo -e "  - MinIO Console: ${BLUE}http://localhost:9001${NC}"
echo ""
echo -e "To update to latest code:"
echo -e "  ${BLUE}git pull && ./scripts/deploy.sh${NC}"
echo ""
echo -e "To stop all services:"
echo -e "  ${RED}docker-compose -f docker-compose.yml down${NC}"
echo ""
