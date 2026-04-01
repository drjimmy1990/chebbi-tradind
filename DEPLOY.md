# 🚀 Chebbi Trading — VPS Deployment Guide (aaPanel + Nginx + PM2)

## Prerequisites

- VPS with **Ubuntu 22.04+** or **Debian 12+**
- **aaPanel** installed
- **Node.js 20+** installed (via aaPanel Software Store → Node.js)
- **PM2** installed globally: `npm i -g pm2`
- **Git** installed: `apt install git -y`
- Domain pointed to your VPS IP (e.g. `chebbi-trading.com`)

---

## Step 1: Upload Project to VPS

### Option A: Git (recommended)

```bash
cd /www/wwwroot
git clone <your-repo-url> chebbi-trading
cd chebbi-trading
```

### Option B: Manual upload via aaPanel File Manager

Upload the project ZIP to `/www/wwwroot/`, then:

```bash
cd /www/wwwroot
unzip chebbi-trading.zip
cd chebbi-trading
```

---

## Step 2: Install Dependencies & Build

```bash
cd /www/wwwroot/chebbi-trading

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Ensure database directory exists
mkdir -p prisma/db

# Push schema to database (creates tables if needed)
npx prisma db push

# Build the production bundle
npx next build
```

After build completes, copy static assets into the standalone folder:

```bash
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/
```

> **Note:** The `build` script in package.json already does this, so you can also just run `npm run build`.

---

## Step 3: Environment File

Create the production `.env` in the **standalone** folder:

```bash
cat > /www/wwwroot/chebbi-trading/.next/standalone/.env << 'EOF'
DATABASE_URL=file:../../prisma/db/dev.db
NODE_ENV=production
PORT=3001
HOSTNAME=0.0.0.0
EOF
```

> **Important:** The database path is relative to the standalone server location (`.next/standalone/`), so `../../prisma/db/dev.db` points back to the project root.

Also keep the root `.env` for Prisma CLI operations:

```bash
cat > /www/wwwroot/chebbi-trading/.env << 'EOF'
DATABASE_URL=file:./db/dev.db
EOF
```

---

## Step 4: Create PM2 Ecosystem File

```bash
cat > /www/wwwroot/chebbi-trading/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'chebbi-trading',
      script: '.next/standalone/server.js',
      cwd: '/www/wwwroot/chebbi-trading',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        HOSTNAME: '0.0.0.0',
        DATABASE_URL: 'file:../../prisma/db/dev.db',
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
      watch: false,
      max_memory_restart: '500M',
      error_file: '/www/wwwroot/chebbi-trading/logs/error.log',
      out_file: '/www/wwwroot/chebbi-trading/logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
EOF

# Create logs directory
mkdir -p /www/wwwroot/chebbi-trading/logs
```

---

## Step 5: Ensure Upload Directory Exists

```bash
mkdir -p /www/wwwroot/chebbi-trading/public/uploads/proofs
chmod 755 /www/wwwroot/chebbi-trading/public/uploads/proofs

# Also ensure it exists inside standalone
mkdir -p /www/wwwroot/chebbi-trading/.next/standalone/public/uploads/proofs
```

---

## Step 6: Start with PM2

```bash
cd /www/wwwroot/chebbi-trading

# Start the app
pm2 start ecosystem.config.js

# Save so it auto-restarts on reboot
pm2 save
pm2 startup
```

### Verify it's running:

```bash
pm2 status
# Should show "chebbi-trading" with status "online"

# Test locally
curl -s http://localhost:3001 | head -20
# Should return HTML
```

---

## Step 7: aaPanel Nginx Reverse Proxy

### 7.1 Create Website in aaPanel

1. Open **aaPanel** → **Website** → **Add site**
2. Domain: `chebbi-trading.com` (your actual domain)
3. PHP Version: **Pure Static** (we don't need PHP)
4. Click **Submit**

### 7.2 Configure SSL (Optional but recommended)

1. Click on the site → **SSL** → **Let's Encrypt**
2. Select your domain → **Apply**

### 7.3 Set Up Reverse Proxy

1. Click on the site → **Reverse proxy** → **Add reverse proxy**
2. Fill in:
   - **Proxy name:** `chebbi`
   - **Target URL:** `http://127.0.0.1:3001`
   - **Send domain:** `$host`
3. Click **Submit**

### 7.4 Custom Nginx Configuration (recommended)

For better performance, click on the site → **Config** (Nginx conf), and replace the location block with:

```nginx
# Main reverse proxy to Next.js
location / {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    proxy_read_timeout 120s;
    proxy_send_timeout 120s;

    # Fix 431 Request Header Fields Too Large
    proxy_buffer_size 128k;
    proxy_buffers 4 256k;
    proxy_busy_buffers_size 256k;
    large_client_header_buffers 4 32k;
}

# Serve uploaded files directly via Nginx (faster)
location /uploads/ {
    alias /www/wwwroot/chebbi-trading/public/uploads/;
    expires 30d;
    add_header Cache-Control "public, immutable";
}

# Serve static assets directly via Nginx
location /_next/static/ {
    alias /www/wwwroot/chebbi-trading/.next/standalone/.next/static/;
    expires 365d;
    add_header Cache-Control "public, immutable";
}
```

Save and restart Nginx from aaPanel.

---

## Step 8: Seed Data (if fresh database)

```bash
cd /www/wwwroot/chebbi-trading
node prisma/seed.js
```

---

## Step 9: Create Admin User

```bash
cd /www/wwwroot/chebbi-trading
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const db = new PrismaClient();
(async () => {
  const hash = await bcrypt.hash('YOUR_SECURE_PASSWORD', 12);
  await db.adminUser.upsert({
    where: { username: 'admin' },
    update: { password: hash },
    create: { username: 'admin', password: hash },
  });
  console.log('Admin user created/updated');
  process.exit(0);
})();
"
```

> Replace `YOUR_SECURE_PASSWORD` with your actual admin password.

---

## Updating the App (future deployments)

```bash
cd /www/wwwroot/chebbi-trading

# Pull latest code
git pull origin main

# Install any new dependencies
npm install

# Rebuild
npm run build

# Copy static + public into standalone (already done by build script)
# But also copy uploads (they live in public/)
cp -r public/uploads .next/standalone/public/ 2>/dev/null || true

# Ensure standalone has the .env
cp .next/standalone/.env .next/standalone/.env.bak 2>/dev/null || true

# Restart PM2
pm2 restart chebbi-trading
```

---

## Troubleshooting

### App won't start
```bash
pm2 logs chebbi-trading --lines 50
```

### 502 Bad Gateway
- Check PM2 is running: `pm2 status`
- Check the port matches Nginx config: `pm2 logs chebbi-trading | grep PORT`
- Verify: `curl http://localhost:3001`

### 431 Request Header Fields Too Large
Already handled in the Nginx config above with larger buffer sizes.

### Database errors
```bash
# Check database file exists
ls -la /www/wwwroot/chebbi-trading/prisma/db/dev.db

# Re-push schema if needed
cd /www/wwwroot/chebbi-trading
npx prisma db push
```

### Uploaded files not showing
```bash
# Ensure the upload directory exists and is writable
chmod -R 755 /www/wwwroot/chebbi-trading/public/uploads/
# Make sure it's also copied to standalone
cp -r public/uploads .next/standalone/public/
```

---

## Architecture Overview

```
Internet → Nginx (aaPanel, port 80/443)
               ↓ reverse proxy
           PM2 → Next.js standalone (port 3001)
               ↓
           SQLite (prisma/db/dev.db)
               ↓
           n8n webhook (external, configured in Settings)
```

## Quick Reference

| Item | Value |
|------|-------|
| App Port | `3001` |
| App Path | `/www/wwwroot/chebbi-trading` |
| Database | `/www/wwwroot/chebbi-trading/prisma/db/dev.db` |
| Uploads | `/www/wwwroot/chebbi-trading/public/uploads/proofs/` |
| PM2 Name | `chebbi-trading` |
| Logs | `/www/wwwroot/chebbi-trading/logs/` |
| Admin URL | `https://yourdomain.com` → click Dashboard |
| Webhook Callback | `POST https://yourdomain.com/api/webhook/member-status` |
