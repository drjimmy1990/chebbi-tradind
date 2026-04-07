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
git clone https://github.com/drjimmy1990/chebbi-tradind chebbi-trading
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
npm run build
```

> The `build` script in package.json already copies `.next/static` and `public/` into the standalone folder.
> **⚠️ IMPORTANT:** After every build, you MUST recreate the standalone `.env` (Step 3 below).

---

## Step 3: Environment File

Create the production `.env` in the **standalone** folder:

```bash
cat > /www/wwwroot/chebbi-trading/.next/standalone/.env << 'EOF'
DATABASE_URL=file:/www/wwwroot/chebbi-trading/prisma/db/dev.db
NODE_ENV=production
PORT=3001
HOSTNAME=0.0.0.0
EOF
```

> **⚠️ CRITICAL:** Must use **absolute path** for DATABASE_URL. The build wipes the standalone folder, so you must recreate this `.env` after every `npm run build`.

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

## Step 5: Start with PM2

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

## Step 6: aaPanel Nginx Reverse Proxy

### 6.1 Create Website in aaPanel

1. Open **aaPanel** → **Website** → **Add site**
2. Domain: `chebbi-trading.com` (your actual domain)
3. PHP Version: **Pure Static** (we don't need PHP)
4. Click **Submit**

### 6.2 Configure SSL (Optional but recommended)

1. Click on the site → **SSL** → **Let's Encrypt**
2. Select your domain → **Apply**

### 6.3 Set Up Reverse Proxy

1. Click on the site → **Reverse proxy** → **Add reverse proxy**
2. Fill in:
   - **Proxy name:** `chebbi`
   - **Target URL:** `http://127.0.0.1:3001`
   - **Send domain:** `$host`
3. Click **Submit**

### 6.4 Custom Nginx Configuration (recommended)

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

    # Allow large file uploads (proof of deposit via base64)
    client_max_body_size 10M;
}

# Serve static assets directly via Nginx
location /_next/static/ {
    alias /www/wwwroot/chebbi-trading/.next/standalone/.next/static/;
    expires 365d;
    add_header Cache-Control "public, immutable";
}

# Serve proof files saved by n8n directly via Nginx
location /uploads/ {
    alias /www/wwwroot/chebbi-trading/public/uploads/;
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

Save and restart Nginx from aaPanel.

---

## Step 7: Seed Data (if fresh database)

```bash
cd /www/wwwroot/chebbi-trading
node prisma/seed.js
```

---

## Step 8: Create Admin User

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

## Step 9: Configure Webhook in Dashboard

1. Go to `https://yourdomain.com` → login to Dashboard
2. Navigate to **Settings**
3. Fill in:
   - **Registration Webhook URL**: Your n8n webhook URL (e.g. `https://n8n.yourdomain.com/webhook/xxx`)
   - **Webhook Secret Key**: A strong secret string (n8n will send this back for verification)
   - **Site URL** (in general settings): Your domain (e.g. `https://chebbi-trading.com`)
4. Click **Save**

---

## Registration & n8n Webhook Flow

```
┌──────────────────────────────────────────────────────────────┐
│  1. USER fills form + picks proof screenshot                 │
│     → File converted to base64 on client                     │
│                                                              │
│  2. POST /api/register                                       │
│     → Member created (status: "pending")                     │
│     → Fires webhook to n8n with:                             │
│        {                                                     │
│          event: "new_registration",                          │
│          memberId, name, email, xmId,                        │
│          proofBase64,           ← file as base64 string      │
│          proofFilename,         ← original filename          │
│          callbackUrl            ← your API callback URL      │
│        }                                                     │
│                                                              │
│  3. n8n RECEIVES webhook                                     │
│     → Decodes base64 → saves file to VPS:                    │
│       /www/wwwroot/chebbi-trading/public/uploads/proofs/      │
│     → Processes verification logic                           │
│     → Decides: accept or reject                              │
│                                                              │
│  4. n8n CALLS BACK                                           │
│     POST https://yourdomain.com/api/webhook/member-status    │
│     {                                                        │
│       memberId: "xxx",                                       │
│       status: "active" | "rejected",                         │
│       secret: "your-webhook-secret",                         │
│       proofFile: "/uploads/proofs/filename.jpg"  (optional)  │
│     }                                                        │
│     → Member status updated in database                      │
└──────────────────────────────────────────────────────────────┘
```

### n8n Workflow Tips

1. **Receive webhook**: Use "Webhook" trigger node
2. **Save file**: Use "Write Binary File" node to decode base64 and save to `/www/wwwroot/chebbi-trading/public/uploads/proofs/`
3. **Verify**: Add your business logic (check XM ID, validate deposit, etc.)
4. **Callback**: Use "HTTP Request" node to POST to the callbackUrl with `memberId`, `status`, `secret`, and optionally `proofFile`

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

---

## Architecture Overview

```
Internet → Nginx (aaPanel, port 80/443)
               ↓ reverse proxy
           PM2 → Next.js standalone (port 3001)
               ↓
           SQLite (prisma/db/dev.db)

Registration flow:
  User → Website form → /api/register → n8n webhook (+ base64 file)
                                            ↓
                          n8n saves file to VPS + verifies
                                            ↓
                          n8n → /api/webhook/member-status (accept/reject)
```

## Quick Reference

| Item | Value |
|------|-------|
| App Port | `3001` |
| App Path | `/www/wwwroot/chebbi-trading` |
| Database | `/www/wwwroot/chebbi-trading/prisma/db/dev.db` |
| Proof Files | `/www/wwwroot/chebbi-trading/public/uploads/proofs/` (managed by n8n) |
| PM2 Name | `chebbi-trading` |
| Logs | `/www/wwwroot/chebbi-trading/logs/` |
| Admin URL | `https://yourdomain.com` → click Dashboard |
| Register API | `POST https://yourdomain.com/api/register` |
| Webhook Callback | `POST https://yourdomain.com/api/webhook/member-status` |














cd /www/wwwroot/chebbi-trading
git pull
npm run build
pm2 restart chebbi-trading
rm -rf /www/server/nginx/proxy_cache_dir/*






cd /www/wwwroot/chebbi-trading
git pull
npx prisma db push
npm run build
pm2 restart all
rm -rf /www/server/nginx/proxy_cache_dir/*




# 1. Update PM2 to use the exact Absolute Path to the database you just uploaded
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
        DATABASE_URL: 'file:/www/wwwroot/chebbi-trading/prisma/db/dev.db'
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '500M'
    }
  ]
};
EOF

# 2. Unlock the database permissions so Next.js can read/write to your uploaded file
chmod -R 777 /www/wwwroot/chebbi-trading/prisma/db

# 3. Reload PM2 to apply the fix
pm2 delete chebbi-trading
pm2 start /www/wwwroot/chebbi-trading/ecosystem.config.js
pm2 save

---

## Latest Update Sequence (with Markdown Migration)

```bash
cd /www/wwwroot/chebbi-trading
git pull
npm install
npm run build
pm2 restart chebbi-trading
node scripts/migrate-html-to-md.js
rm -rf /www/server/nginx/proxy_cache_dir/*
```



git reset --hard HEAD
git pull
npm install
npm run build
pm2 restart chebbi-trading
node scripts/migrate-html-to-md.js
rm -rf /www/server/nginx/proxy_cache_dir/*



git pull
npm run build
pm2 restart chebbi-trading
