# Server Infrastructure

## Server
- **Provider:** Alibaba Cloud VPC
- **IP:** `47.251.113.72`
- **User:** `root`
- **Hostname:** `usadev1`

---

## How It Works

**nginx** runs on port 80 (and 443 for SSL) and acts as a reverse proxy. All incoming HTTP traffic hits nginx first, which then routes the request to the correct Docker container based on the domain name.

```
Internet
   │
   ▼
nginx (port 80/443)
   ├── brightwill.ai       →  Docker: brightwill    (localhost:3003)
   ├── www.brightwill.ai   →  Docker: brightwill    (localhost:3003)
   ├── trybite.us          →  Docker: bite-web      (localhost:3000)
   ├── admin.trybite.us    →  Docker: bite-admin    (localhost:3002)
   └── [menu subdomain]    →  Docker: bite-menu     (localhost:3001)
```

> **Note:** Confirm the trybite.us subdomain routing above — this was inferred from container names.

---

## Docker Containers

| Container       | Image        | Host Port | Container Port | Repo              |
|-----------------|--------------|-----------|----------------|-------------------|
| `brightwill`    | `brightwill` | `3003`    | `3000`         | `~/geoptimizer`   |
| `bite-web-1`    | `bite-web`   | `3000`    | `3000`         | `~/bite` (?)      |
| `bite-menu-1`   | `bite-menu`  | `3001`    | `3001`         | `~/bite` (?)      |
| `bite-admin-1`  | `bite-admin` | `3002`    | `3002`         | `~/bite` (?)      |

All containers run with `--restart unless-stopped` (auto-restart on reboot/crash).

---

## Nginx Config Files

| File                                          | Domain               |
|-----------------------------------------------|----------------------|
| `/etc/nginx/sites-available/brightwill`       | `brightwill.ai`      |
| `/etc/nginx/sites-enabled/brightwill` (symlink)| active              |

### brightwill config (`/etc/nginx/sites-available/brightwill`)
```nginx
server {
    listen 80;
    server_name brightwill.ai www.brightwill.ai;

    location / {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Auto-Deploy (CI/CD)

### BrightWill (geoptimizer)
- **Trigger:** Push to `main` on GitHub
- **Workflow:** `.github/workflows/deploy.yml`
- **Steps:** lint → type-check → build → SSH into server → `git pull` → `docker build` → restart container on port 3003

### Bite App
- Has its own auto-deploy setup (separate repo/workflow)

---

## Useful Commands

```bash
# Check running containers
docker ps

# View logs for brightwill
docker logs brightwill

# Restart brightwill
docker restart brightwill

# Manually redeploy brightwill
cd ~/geoptimizer
git pull origin main
docker build -t brightwill .
docker stop brightwill && docker rm brightwill
docker run -d --name brightwill -p 3003:3000 -e DATABASE_URL="file:./dev.db" --restart unless-stopped brightwill

# Test nginx config
nginx -t

# Reload nginx (no downtime)
systemctl reload nginx

# View nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## Port Reference

| Port | Used By              |
|------|----------------------|
| 80   | nginx (HTTP)         |
| 443  | nginx (HTTPS/SSL)    |
| 3000 | Docker: bite-web     |
| 3001 | Docker: bite-menu    |
| 3002 | Docker: bite-admin   |
| 3003 | Docker: brightwill   |
