# CyberSec Platform - Docker Setup

This directory contains Docker configuration for the CyberSec Platform.

## Quick Start

### Production Deployment (Recommended)

Uses pre-built images from GitHub Container Registry:

```bash
# Initial setup
./scripts/start.sh

# Update to latest version
./scripts/deploy.sh
```

### Local Development

Builds images locally from source:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

## Files

- `docker-compose.prod.yml` - Production deployment (pulls pre-built images)
- `docker-compose.dev.yml` - Development environment (builds locally)
- `docker-compose.yml` - Legacy file (reference docker-compose.prod.yml for production)

## Documentation

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for comprehensive deployment guide.

## Image Sources

Production images are built via GitHub Actions and available at:

- `ghcr.io/mannuvilasara/cybersec-web:latest`
- `ghcr.io/mannuvilasara/cybersec-auth-service:latest`
- `ghcr.io/mannuvilasara/cybersec-ai-service:latest`
- `ghcr.io/mannuvilasara/cybersec-securebot:latest`

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
nano .env
```

Critical variables:

- `JWT_SECRET` - Secret for JWT tokens
- `OPENAI_API_KEY` - OpenAI API key
- `GITHUB_APP_ID`, `GITHUB_PRIVATE_KEY` - GitHub App credentials
- `GITHUB_REPOSITORY_OWNER` - Your GitHub username (for pulling images)
- `DOMAIN`, `EMAIL` - For SSL certificates

## Services

| Service      | Port       | Description        |
| ------------ | ---------- | ------------------ |
| web          | 3000       | Next.js frontend   |
| auth-service | 3001       | Authentication API |
| ai-service   | 3002       | AI/LLM API         |
| securebot    | 3003       | GitHub bot service |
| nginx        | 80, 443    | Reverse proxy      |
| postgres     | 5432       | Database           |
| redis        | 6379       | Cache              |
| minio        | 9000, 9001 | Object storage     |

All services are behind nginx reverse proxy at `https://secureauth.mannu.live`.
