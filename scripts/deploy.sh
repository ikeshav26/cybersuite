#!/bin/bash

# Quick deployment script - pulls latest images and restarts services
# Usage: ./scripts/deploy.sh [tag]

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

IMAGE_TAG=${1:-latest}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Quick Deployment - Tag: ${IMAGE_TAG}${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Load environment
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

echo -e "${YELLOW}Pulling latest images (tag: ${IMAGE_TAG})...${NC}"
IMAGE_TAG=$IMAGE_TAG docker-compose -f docker-compose.prod.yml pull

echo -e "${YELLOW}Recreating services with new images...${NC}"
IMAGE_TAG=$IMAGE_TAG docker-compose -f docker-compose.prod.yml up -d --force-recreate --no-build

echo -e "${YELLOW}Pruning old images...${NC}"
docker image prune -f

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Check service status with:"
echo -e "  ${GREEN}docker-compose -f docker-compose.prod.yml ps${NC}"
echo ""
echo -e "View logs with:"
echo -e "  ${GREEN}docker-compose -f docker-compose.prod.yml logs -f${NC}"
echo ""
