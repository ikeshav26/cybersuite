# Docker Deployment Guide

This guide covers deploying the CyberSec Platform using Docker and GitHub Actions for CI/CD.

## Architecture Overview

The application uses a **CI/CD workflow** where:

1. **GitHub Actions** builds Docker images on every push/tag
2. Images are pushed to **GitHub Container Registry (GHCR)**
3. **Production servers** pull pre-built images and run them

## Prerequisites

### On Development Machine

- Git
- GitHub account with repository access

### On Production Server

- Docker Engine 20.10+
- Docker Compose 2.0+
- Domain pointing to server (secureauth.mannu.live)
- Ports 80 and 443 open

## Quick Start

### 1. Initial Setup on Production Server

```bash
# Clone the repository
git clone https://github.com/MannuVilasara/hacknauts-sentinels.git
cd hacknauts-sentinels

# Create .env file from template
cp .env.example .env

# Edit .env with your actual values
nano .env
```

### 2. Configure Environment Variables

Edit `.env` and update these critical values:

```env
# Database (can keep defaults or customize)
POSTGRES_USER=cybersec
POSTGRES_PASSWORD=your-secure-password
POSTGRES_DB=cybersec_auth

# JWT Secret (MUST change in production)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long

# AI Service API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...

# GitHub App Configuration
GITHUB_APP_ID=123456
GITHUB_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----
GITHUB_WEBHOOK_SECRET=your-webhook-secret

# GitHub Container Registry (for pulling images)
GITHUB_REPOSITORY_OWNER=mannuvilasara  # Your GitHub username (lowercase)
IMAGE_TAG=latest  # or specific version tag

# Domain and Email (for SSL)
DOMAIN=secureauth.mannu.live
EMAIL=your-email@example.com
```

### 3. Deploy the Application

```bash
# Make scripts executable
chmod +x scripts/start.sh scripts/setup-ssl.sh

# Run the deployment script
./scripts/start.sh
```

The script will:

- Pull latest images from GHCR
- Start infrastructure services (PostgreSQL, Redis, MinIO)
- Run database migrations
- Optionally setup SSL certificates
- Start all application services

## CI/CD Pipeline

### GitHub Actions Workflow

The workflow (`.github/workflows/docker-build.yml`) automatically:

1. Builds Docker images for all services
2. Pushes to GitHub Container Registry
3. Tags images with:
   - Branch name (e.g., `main`, `develop`)
   - Git SHA
   - Semantic version (if tagged)
   - `latest` for default branch

### Making Images Public

By default, GitHub Container Registry images are private. To make them public:

1. Go to https://github.com/users/YOUR_USERNAME/packages
2. Find each package (cybersec-web, cybersec-auth-service, etc.)
3. Click "Package settings"
4. Scroll to "Danger Zone"
5. Click "Change visibility" → "Public"

Alternatively, authenticate on your server:

```bash
# Create a GitHub Personal Access Token with 'read:packages' permission
echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_USERNAME --password-stdin
```

## Docker Compose Files

### `docker-compose.prod.yml` (Production)

- Uses pre-built images from GHCR
- Pulls images instead of building
- Uses `.env` file for configuration
- Suitable for production deployment

### `docker-compose.dev.yml` (Development)

- Builds images locally from source
- For local development and testing
- Exposes all service ports

Usage:

```bash
# Development
docker-compose -f docker-compose.dev.yml up --build

# Production
docker-compose -f docker-compose.prod.yml up -d
```

## SSL/HTTPS Setup

### Automatic Setup (Recommended)

Run the SSL setup script:

```bash
./scripts/setup-ssl.sh
```

This will:

1. Start nginx temporarily
2. Request SSL certificate from Let's Encrypt
3. Configure automatic renewal

### Manual Setup

```bash
# Start nginx
docker-compose -f docker-compose.prod.yml up -d nginx

# Request certificate
docker-compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email your-email@example.com \
  --agree-tos \
  -d secureauth.mannu.live

# Restart nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

## Common Operations

### Update to Latest Images

```bash
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

### View Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f web
docker-compose -f docker-compose.prod.yml logs -f auth-service
```

### Restart Services

```bash
# All services
docker-compose -f docker-compose.prod.yml restart

# Specific service
docker-compose -f docker-compose.prod.yml restart web
```

### Stop Services

```bash
# Stop but keep data
docker-compose -f docker-compose.prod.yml down

# Stop and remove volumes (⚠️ deletes data)
docker-compose -f docker-compose.prod.yml down -v
```

### Database Migrations

```bash
docker-compose -f docker-compose.prod.yml run --rm auth-service \
  sh -c "npx prisma migrate deploy"
```

### Access Container Shell

```bash
docker-compose -f docker-compose.prod.yml exec web sh
docker-compose -f docker-compose.prod.yml exec auth-service sh
```

## Monitoring

### Check Service Status

```bash
docker-compose -f docker-compose.prod.yml ps
```

### Check Health

```bash
# Overall health
docker-compose -f docker-compose.prod.yml ps

# Individual service health
docker inspect cybersec-web --format='{{.State.Health.Status}}'
```

### Resource Usage

```bash
docker stats
```

## Troubleshooting

### Images Not Pulling

1. Check image visibility (public vs private)
2. Verify `GITHUB_REPOSITORY_OWNER` in `.env` matches your username
3. Authenticate with GHCR if images are private

### Service Won't Start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs [service-name]

# Check if port is in use
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker-compose -f docker-compose.prod.yml ps postgres

# Check database logs
docker-compose -f docker-compose.prod.yml logs postgres

# Test connection
docker-compose -f docker-compose.prod.yml exec postgres \
  psql -U cybersec -d cybersec_auth -c "SELECT 1;"
```

### SSL Certificate Issues

```bash
# Check certificate exists
ls -la infrastructure/docker/certbot/conf/live/secureauth.mannu.live/

# Test certificate renewal
docker-compose -f docker-compose.prod.yml run --rm certbot renew --dry-run

# Check nginx logs
docker-compose -f docker-compose.prod.yml logs nginx
```

## Security Recommendations

1. **Change default passwords** in `.env`
2. **Use strong JWT_SECRET** (min 32 characters)
3. **Secure .env file**: `chmod 600 .env`
4. **Enable firewall**: Only allow ports 22, 80, 443
5. **Regular updates**: Pull latest images weekly
6. **Backup database**: Regular PostgreSQL backups
7. **Monitor logs**: Check for suspicious activity

## Backup and Restore

### Backup Database

```bash
docker-compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U cybersec cybersec_auth > backup_$(date +%Y%m%d).sql
```

### Restore Database

```bash
docker-compose -f docker-compose.prod.yml exec -T postgres \
  psql -U cybersec cybersec_auth < backup_20231115.sql
```

### Backup Volumes

```bash
docker run --rm \
  -v cybersec_postgres_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/postgres_backup.tar.gz /data
```

## Environment Variables Reference

| Variable                  | Required | Description                              |
| ------------------------- | -------- | ---------------------------------------- |
| `POSTGRES_USER`           | Yes      | PostgreSQL username                      |
| `POSTGRES_PASSWORD`       | Yes      | PostgreSQL password                      |
| `POSTGRES_DB`             | Yes      | PostgreSQL database name                 |
| `JWT_SECRET`              | Yes      | Secret key for JWT tokens (min 32 chars) |
| `OPENAI_API_KEY`          | Yes      | OpenAI API key for AI service            |
| `ANTHROPIC_API_KEY`       | Optional | Anthropic Claude API key                 |
| `GEMINI_API_KEY`          | Optional | Google Gemini API key                    |
| `GITHUB_APP_ID`           | Yes      | GitHub App ID                            |
| `GITHUB_PRIVATE_KEY`      | Yes      | GitHub App private key                   |
| `GITHUB_WEBHOOK_SECRET`   | Yes      | GitHub webhook secret                    |
| `GITHUB_REPOSITORY_OWNER` | Yes      | GitHub username (for GHCR)               |
| `IMAGE_TAG`               | No       | Image tag to pull (default: latest)      |
| `DOMAIN`                  | Yes      | Your domain name                         |
| `EMAIL`                   | Yes      | Email for SSL certificates               |

## Support

For issues or questions:

- GitHub Issues: https://github.com/MannuVilasara/hacknauts-sentinels/issues
- Documentation: Check `/docs` folder

## License

See LICENSE file in the repository.
