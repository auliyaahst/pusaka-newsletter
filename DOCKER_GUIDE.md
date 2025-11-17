# Docker Setup for Pusaka Newsletter

## Overview

This Docker setup provides:
- ✅ **No file duplication** - uses volumes to mount your local code
- ✅ **Hot reload** - changes reflect immediately without rebuilding
- ✅ **PostgreSQL** - isolated database in container
- ✅ **Multi-stage builds** - efficient image layers
- ✅ **Development & Production** targets

## Quick Start

### 1. Start Everything

```bash
# Build and start all services
docker-compose up --build

# Or run in background (detached mode)
docker-compose up -d --build
```

### 2. Access Your App

- **App**: http://localhost:3000
- **PostgreSQL**: localhost:5432

### 3. View Logs

```bash
# All services
docker-compose logs -f

# Just the app
docker-compose logs -f app

# Just the database
docker-compose logs -f postgres
```

## How It Works (No Duplication)

### Volume Mounting Strategy

```yaml
volumes:
  - .:/app              # Mount your entire project
  - /app/node_modules   # BUT exclude node_modules (use container's)
  - /app/.next          # AND exclude .next (use container's)
```

**What this means:**
- ✅ Your source code is mounted from your local machine
- ✅ Changes to `.tsx`, `.ts`, `.css` files reflect immediately
- ✅ No files are copied/duplicated in containers
- ✅ `node_modules` and `.next` stay in container (faster)

### Multi-Stage Dockerfile

```dockerfile
FROM base AS deps      # Install dependencies (cached)
FROM base AS dev       # Development mode
FROM base AS builder   # Build for production
FROM base AS prod      # Production runtime
```

**Benefits:**
- Smaller image sizes
- Better layer caching
- Faster rebuilds
- Separate dev/prod environments

## Common Commands

### Development

```bash
# Start development environment
docker-compose up

# Rebuild after package.json changes
docker-compose up --build

# Stop all services
docker-compose down

# Stop and remove volumes (fresh start)
docker-compose down -v
```

### Database Management

```bash
# Run Prisma migrations
docker-compose exec app npx prisma migrate dev

# Open Prisma Studio
docker-compose exec app npx prisma studio

# Check database
docker-compose exec app npx tsx scripts/check-payments.ts

# Access PostgreSQL directly
docker-compose exec postgres psql -U postgres -d pusaka_newsletter
```

### Debugging

```bash
# Shell into app container
docker-compose exec app sh

# Shell into postgres container
docker-compose exec postgres sh

# Check container status
docker-compose ps

# View resource usage
docker stats
```

## File Structure

```
pusaka-newsletter/
├── Dockerfile              # Multi-stage build definition
├── docker-compose.yml      # Service orchestration
├── .dockerignore          # Files to exclude from builds
└── DOCKER_GUIDE.md        # This guide
```

## Key Features

### 1. No File Duplication ✅

Your code stays on your machine. Docker just *mounts* it:

```
Your Machine          Docker Container
────────────         ────────────────
src/                 → /app/src/
public/              → /app/public/
package.json         → /app/package.json
                     
[NOT mounted]          /app/node_modules (container's)
[NOT mounted]          /app/.next (container's)
```

### 2. Hot Reload ✅

Next.js dev server watches your mounted files:
- Edit `src/app/page.tsx` → See changes immediately
- Edit `src/components/` → Auto-refresh in browser
- No rebuild needed for code changes

### 3. Persistent Database ✅

PostgreSQL data is stored in a named volume:
```bash
# Data persists across restarts
docker-compose down  # Stops containers
docker-compose up    # Data still there!

# To reset database
docker-compose down -v  # -v removes volumes
```

### 4. Isolated Environment ✅

Each service runs in its own container:
- App container: Node.js 22, your code
- DB container: PostgreSQL 15
- Network: Bridge network for communication

## Troubleshooting

### "EADDRINUSE: address already in use"

Port 3000 or 5432 is already in use:
```bash
# Stop local services
pkill -f "next dev"
pg_ctl -D /usr/local/var/postgres stop

# Or change ports in docker-compose.yml
ports:
  - "3001:3000"  # Map to different port
```

### "npm ci can only install packages when..."

Package lock file out of sync:
```bash
# Rebuild with --build
docker-compose up --build
```

### Changes not reflecting

```bash
# Restart the app service
docker-compose restart app

# Or rebuild
docker-compose up --build
```

### Database connection issues

```bash
# Check if postgres is healthy
docker-compose ps

# View postgres logs
docker-compose logs postgres

# Verify migrations ran
docker-compose exec app npx prisma migrate status
```

## Production Deployment

For production, use the production stage:

```bash
# Build production image
docker build --target prod -t pusaka-newsletter:prod .

# Run production container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e NEXTAUTH_URL="https://yourdomain.com" \
  pusaka-newsletter:prod
```

## Performance Tips

### 1. Use BuildKit (faster builds)
```bash
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
```

### 2. Limit log size
```yaml
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 3. Prune regularly
```bash
# Remove unused images/containers
docker system prune -a

# Remove unused volumes
docker volume prune
```

## FAQ

**Q: Do I need to rebuild after code changes?**  
A: No! Code is mounted from your machine. Changes reflect immediately.

**Q: Do I need to rebuild after package.json changes?**  
A: Yes. Run `docker-compose up --build`

**Q: Where is my database data stored?**  
A: In a Docker volume named `pusaka-newsletter_postgres_data`

**Q: Can I use this with ngrok for webhooks?**  
A: Yes! Just run ngrok on your host: `ngrok http 3000`

**Q: How do I connect to the database from outside Docker?**  
A: Use `localhost:5432` with credentials from docker-compose.yml

**Q: What if I want to use my local database instead?**  
A: Comment out the `postgres` service and update `DATABASE_URL` to point to `host.docker.internal:5432`

## Next Steps

1. ✅ Start Docker: `docker-compose up`
2. ✅ Visit http://localhost:3000
3. ✅ Make code changes and see them live
4. ✅ Use database scripts: `docker-compose exec app npx tsx scripts/check-payments.ts`
5. ✅ Set up ngrok for webhook testing (see WEBHOOK_SETUP_GUIDE.md)

## Useful Links

- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Next.js Docker Guide](https://nextjs.org/docs/deployment)
- [Prisma with Docker](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
