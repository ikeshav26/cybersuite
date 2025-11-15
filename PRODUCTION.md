# Production Deployment Quick Reference

## Overview

This application uses **GitHub Actions** to build Docker images and **GitHub Container Registry (GHCR)** to distribute them. Your production server simply pulls and runs pre-built images.

## First-Time Setup

### 1. On Your Server

```bash
# Clone repository
git clone https://github.com/MannuVilasara/hacknauts-sentinels.git
cd hacknauts-sentinels

# Create environment file
cp .env.example .env
nano .env  # Update with your values
```

### 2. Configure `.env`

**Required variables:**

```env
# Your GitHub username (lowercase) - for pulling images
GITHUB_REPOSITORY_OWNER=mannuvilasara

# Database credentials
POSTGRES_USER=cybersec
POSTGRES_PASSWORD=your-secure-password

# JWT secret (min 32 characters)
JWT_SECRET=your-super-secret-key-here

# API Keys
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...

# GitHub App
GITHUB_APP_ID=123456
GITHUB_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----...
GITHUB_WEBHOOK_SECRET=...

# Domain for SSL
DOMAIN=secureauth.mannu.live
EMAIL=your-email@example.com
```

### 3. Deploy

```bash
chmod +x scripts/start.sh
./scripts/start.sh
```

This will:

- ✅ Pull latest Docker images from GHCR
- ✅ Start all services
- ✅ Setup SSL certificates (optional)

## Daily Operations

### Update Application

When new code is pushed to GitHub (main branch):

```bash
./scripts/deploy.sh
```

This pulls the latest images and restarts services.

### Check Status

```bash
docker-compose ps
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f web
docker-compose logs -f auth-service
```

### Restart Service

```bash
docker-compose restart web
```

### Stop Everything

```bash
docker-compose down
```

## How It Works

### CI/CD Pipeline

1. **Developer pushes code** to GitHub (main, develop, or tags)
2. **GitHub Actions runs** `.github/workflows/docker-build.yml`
3. **Docker images are built** for each service
4. **Images pushed to GHCR** at `ghcr.io/mannuvilasara/cybersec-*:latest`
5. **Server pulls images** when you run `./scripts/deploy.sh`

### Image Naming

Images follow this pattern:

- `ghcr.io/mannuvilasara/cybersec-web:latest`
- `ghcr.io/mannuvilasara/cybersec-auth-service:latest`
- `ghcr.io/mannuvilasara/cybersec-ai-service:latest`
- `ghcr.io/mannuvilasara/cybersec-securebot:latest`

### Access URLs

After deployment, access at:

- **Web App**: https://secureauth.mannu.live
- **Auth API**: https://secureauth.mannu.live/api/auth
- **AI API**: https://secureauth.mannu.live/api/ai
- **Securebot**: https://secureauth.mannu.live/api/securebot
- **MinIO Console**: http://your-server-ip:9001

## Files Structure

```
.
├── docker-compose.yml           # Production (pulls images)
├── docker-compose.prod.yml      # Same as above
├── docker-compose.dev.yml       # Development (builds locally)
├── .env.example                 # Environment template
├── scripts/
│   ├── start.sh                # Initial deployment
│   ├── deploy.sh               # Quick update
│   └── setup-ssl.sh            # SSL certificate setup
├── .github/workflows/
│   └── docker-build.yml        # CI/CD pipeline
└── docs/
    └── DEPLOYMENT.md           # Full documentation
```

## Troubleshooting

### Images Not Found

Make images public in GitHub:

1. Go to https://github.com/users/YOUR_USERNAME/packages
2. For each package → Settings → Change visibility → Public

Or authenticate:

```bash
echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_USERNAME --password-stdin
```

### Service Won't Start

Check logs:

```bash
docker-compose logs [service-name]
```

### Port Already in Use

```bash
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
# Kill the process using the port
```

### Database Issues

```bash
# Check database
docker-compose exec postgres psql -U cybersec -d cybersec_auth -c "SELECT 1;"

# Reset database (⚠️ deletes all data)
docker-compose down -v
docker-compose up -d postgres
```

## Support

- **Full Documentation**: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- **Docker Guide**: [DOCKER.md](DOCKER.md)
- **Issues**: https://github.com/MannuVilasara/hacknauts-sentinels/issues

## Security Checklist

- [ ] Changed default database password
- [ ] Set strong JWT_SECRET (min 32 chars)
- [ ] Secured .env file (`chmod 600 .env`)
- [ ] Enabled firewall (ports 22, 80, 443 only)
- [ ] SSL certificates configured
- [ ] Regular backups scheduled
- [ ] Monitoring setup

---

**Quick Commands Cheat Sheet:**

```bash
# Deploy first time
./scripts/start.sh

# Update to latest
./scripts/deploy.sh

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Restart
docker-compose restart

# Stop
docker-compose down

# Update specific version
./scripts/deploy.sh v1.2.3
```
