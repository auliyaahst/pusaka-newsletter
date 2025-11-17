# Docker Quick Reference

## 🚀 Getting Started

```bash
# Start everything
docker-compose up --build

# Start in background
docker-compose up -d --build

# Or use the helper script
./docker-helper.sh start-bg
```

## 📝 Common Commands

| Command | What it does |
|---------|--------------|
| `./docker-helper.sh start` | Start all services |
| `./docker-helper.sh start-bg` | Start in background |
| `./docker-helper.sh stop` | Stop all services |
| `./docker-helper.sh logs` | View logs |
| `./docker-helper.sh shell` | Open app shell |
| `./docker-helper.sh check-payments` | Check payment records |
| `./docker-helper.sh migrate` | Run database migrations |
| `./docker-helper.sh clean` | Remove everything |

## 🔧 Manual Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f app

# Run commands in container
docker-compose exec app npx prisma migrate dev
docker-compose exec app npx tsx scripts/check-payments.ts

# Database access
docker-compose exec postgres psql -U postgres -d pusaka_newsletter
```

## 📁 No Duplication Setup

✅ **Your code stays on your machine**  
✅ **Changes reflect immediately**  
✅ **No copying files to containers**

```
Your Project         Docker Container
────────────        ────────────────
src/                → /app/src/ (mounted)
public/             → /app/public/ (mounted)
package.json        → /app/package.json (mounted)

[NOT mounted]       /app/node_modules (container only)
[NOT mounted]       /app/.next (container only)
```

## 🐛 Troubleshooting

**Port already in use:**
```bash
# Kill local processes
pkill -f "next dev"

# Or change ports in docker-compose.yml
ports:
  - "3001:3000"
```

**Changes not reflecting:**
```bash
docker-compose restart app
```

**Database issues:**
```bash
docker-compose logs postgres
docker-compose exec app npx prisma migrate status
```

**Fresh start:**
```bash
docker-compose down -v  # Removes volumes too
docker-compose up --build
```

## 🌐 With ngrok (for webhooks)

```bash
# Start Docker services
docker-compose up -d

# In another terminal, start ngrok
ngrok http 3000

# Use ngrok URL in Xendit Dashboard
https://abc123.ngrok.io/api/payments/webhook/xendit
```

## 📊 Monitoring

```bash
# Container status
docker-compose ps

# Resource usage
docker stats

# Disk usage
docker system df
```

## 🎯 Pro Tips

1. **Don't rebuild unless package.json changed**
   - Code changes = no rebuild needed
   - Package.json changes = rebuild required

2. **Use the helper script**
   - Faster than typing commands
   - `./docker-helper.sh help`

3. **Check logs when debugging**
   - `./docker-helper.sh logs`
   - `./docker-helper.sh logs-app`

4. **Database persists across restarts**
   - `docker-compose down` = data stays
   - `docker-compose down -v` = data deleted
