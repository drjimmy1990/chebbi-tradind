#!/bin/bash
# ============================================================
# Chebbi Trading — Post-Build Source Cleanup
# ============================================================
# Run this AFTER a successful build to remove source code
# from the VPS while keeping the app running.
#
# Usage:  bash cleanup-source.sh
#
# ⚠️  After running this, you CANNOT rebuild on the VPS.
#     To deploy again, you must: git clone → npm install → npm run build
# ============================================================

set -e

echo "🧹 Cleaning source code from VPS..."
echo ""

# ── Source code (not needed at runtime) ──
rm -rf src/
rm -rf components/
rm -rf scripts/
rm -rf .git/
rm -rf .agents/

# ── Config files (only needed for building) ──
rm -f next.config.ts
rm -f tsconfig.json
rm -f tailwind.config.ts
rm -f postcss.config.mjs
rm -f components.json
rm -f eslint.config.mjs

# ── Seed / dev files ──
rm -f seed-logo.ts
rm -f prisma/seed.ts

# ── Documentation ──
rm -f *.md
rm -f worklog.md
rm -f blog\ post.md

# ── Git / IDE ──
rm -rf .gitignore
rm -rf .vscode/

echo "✅ Source code removed. The app keeps running from .next/standalone/"
echo ""
echo "📁 What's left (required):"
echo "   .next/standalone/   → the production server"
echo "   .env                → environment variables"
echo "   prisma/schema.prisma + dev.db → database"
echo "   public/             → static assets (if not in standalone)"
echo "   package.json        → needed by PM2"
echo "   node_modules/       → Prisma client runtime"
echo ""
echo "⚠️  To deploy next time, re-clone the repo:"
echo "   git clone https://github.com/drjimmy1990/chebbi-tradind.git ."
echo "   npm install"
echo "   npm run build"
echo "   pm2 restart all"
