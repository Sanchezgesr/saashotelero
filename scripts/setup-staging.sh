#!/bin/bash
# ================================================================
# Setup Staging Environment — HControl
# ================================================================
# Requisitos: Supabase CLI, Vercel CLI, Node.js 22+, GitHub CLI
# ================================================================

set -euo pipefail

echo "=== 1. CREAR PROYECTO SUPABASE DE STAGING ==="
echo "Ve a https://supabase.com/dashboard/projects → New Project"
echo "  Name: hcontrol-staging"
echo "  Database Password: (guárdala)"
echo "  Region: US East (N. Virginia) — same as production"
echo ""
echo "Una vez creado, ve a Project Settings > API:"
echo "  - Anota Project URL (NEXT_PUBLIC_SUPABASE_URL)"
echo "  - Anota anon public key (NEXT_PUBLIC_SUPABASE_ANON_KEY)"
echo "  - Anota service_role key (SUPABASE_SERVICE_ROLE_KEY)"
echo "  - Anota Database URL: postgresql://postgres:xxxx@db.REF.supabase.co:5432/postgres"
echo ""

echo "=== 2. LINK SUPABASE CLI ==="
npx supabase link --project-ref <STAGING_REF>
echo ""

echo "=== 3. APLICAR MIGRACIONES ==="
npx supabase db push
echo ""

echo "=== 4. CONFIGURAR ENV VARS EN GITHUB ==="
echo "Agrega estos secrets a GitHub (Settings > Secrets and variables > Actions):"
echo "  SUPABASE_DATABASE_URL     - postgresql://postgres:xxxx@db.REF.supabase.co:5432/postgres"
echo "  SUPABASE_ACCESS_TOKEN     - Personal Access Token de Supabase"
echo "  (Staging vars con prefijo STAGING_)"
echo ""

echo "=== 5. CREAR PROYECTO EN VERCEL ==="
echo "vercel project create hcontrol-staging"
echo "vercel link"
echo "vercel env pull .env.staging"
echo ""

echo "=== 6. AGREGAR REMOTE DE STAGING A GIT ==="
echo "Crea branch staging: git checkout -b staging"
echo "Push: git push origin staging"
echo ""

echo "=== LISTO ==="
echo "CI/CD pipeline:"
echo "  - master  → test + build → deploy a producción (Vercel)"
echo "  - staging → test + build → deploy a staging (Vercel preview)"
echo ""
echo "Backups automáticos: todos los días a las 6:00 AM (UTC)"
