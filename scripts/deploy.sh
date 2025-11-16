#!/bin/bash

# Quick deployment script - builds and restarts services locally
# Usage: ./scripts/deploy.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Quick Deployment - Local Build${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Load environment
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

echo -e "${YELLOW}Building all services locally...${NC}"
docker-compose -f docker-compose.yml build --parallel

echo -e "${YELLOW}Recreating services with new builds...${NC}"
docker-compose -f docker-compose.yml up -d --force-recreate

echo -e "${YELLOW}Pruning old images...${NC}"
docker image prune -f

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Check service status with:"
echo -e "  ${GREEN}docker-compose -f docker-compose.yml ps${NC}"
echo ""
echo -e "View logs with:"
echo -e "  ${GREEN}docker-compose -f docker-compose.yml logs -f${NC}"
echo ""
