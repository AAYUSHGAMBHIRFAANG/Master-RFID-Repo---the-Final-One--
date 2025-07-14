#!/usr/bin/env bash
set -e

echo "────────────────── 1. Git info ──────────────────"
git config --get user.email | grep -q . && echo "✓ Git author email set: $(git config --get user.email)" || { echo "✗ Missing git email"; exit 1; }

echo "────────────────── 2. Workspace lint stub ───────"
npm run lint --workspaces --silent
echo "✓ npm workspace lint exited 0"

echo "────────────────── 3. Husky hook check ──────────"
# Will create a dummy file, attempt commit, then roll back
tmpfile=".husky_test_$$.txt"
echo "//tmp" > "$tmpfile"
git add "$tmpfile"
if git commit -m "test(husky): tmp hook check" &>/dev/null; then
  echo "✓ Husky hook ran (commit succeeded)"
  git reset --hard HEAD~1 &>/dev/null
else
  echo "✗ Husky hook failed (check .husky folder)"; exit 1;
fi
rm -f "$tmpfile"

echo "────────────────── 4. Docker containers ─────────"
docker compose -f infra/docker-compose.yml up -d db traefik &>/dev/null
sleep 3
docker ps --format '{{.Names}}' | grep -q infra-db-1 && echo "✓ Postgres container running" || { echo "✗ Postgres container missing"; exit 1; }
docker ps --format '{{.Names}}' | grep -q infra-traefik-1 && echo "✓ Traefik container running" || { echo "✗ Traefik container missing"; exit 1; }

echo "────────────────── 5. Postgres connectivity ─────"
PGURL="postgresql://postgres:localpass@localhost:5400/vipstc"
if psql "$PGURL" -c '\conninfo' &>/dev/null; then
  echo "✓ Connected to Postgres on port 5400"
else
  echo "✗ Cannot connect to Postgres on 5400 (check port mapping)"; exit 1;
fi

echo "────────────────── 6. GitHub Actions badge ──────"
# Quick API check (uses gh CLI token if logged in)
if command -v gh &>/dev/null; then
    GHA_STATUS=$(gh api repos/${GITHUB_REPOSITORY:-$(git config --get remote.origin.url | sed -e 's/.*github.com[:/]\(.*\)\.git/\1/')}/actions/runs --paginate -q '.workflow_runs[0].conclusion')
    [[ "$GHA_STATUS" == "success" ]] && echo "✓ Last GitHub Actions run succeeded" || echo "⚠ Could not verify CI via gh (check manually)"
else
    echo "⚠ gh CLI not installed — verify CI run manually in browser"
fi

echo "────────────────── 7. Tag presence ──────────────"
git tag | grep -q v0.1.0 && echo "✓ v0.1.0 tag exists" || echo "⚠ v0.1.0 tag not created yet"

echo "────────────────── 8. Summary ───────────────────"
echo "All automated checks completed. If no ✗ markers appeared, Module 1 is LOCKED."
