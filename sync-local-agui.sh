#!/usr/bin/env bash
#
# Rebuild the local @ag-ui/claude-agent-sdk source and install it over the
# published copy in backend/node_modules.
#
# Why copy instead of `npm link`: this package's peer deps (@ag-ui/core,
# @ag-ui/client, @anthropic-ai/*) must resolve to the SAME copies the backend
# uses. A symlink makes Node resolve them from the ag-ui repo instead, which
# gives you two copies of @ag-ui/core and breaks instanceof/enum identity.
# Keeping the package physically inside backend/node_modules avoids that.
#
# Undo with:  ./sync-local-agui.sh --restore
#
set -euo pipefail

PKG="${AGUI_PKG:-$HOME/copilotkit/AGUI/ag-ui/integrations/claude-agent-sdk/typescript}"
DEST="$(cd "$(dirname "$0")" && pwd)/backend/node_modules/@ag-ui/claude-agent-sdk"

if [ "${1:-}" = "--restore" ]; then
  [ -d "$DEST/dist.published.bak" ] || { echo "No backup found; run: cd backend && npm install"; exit 1; }
  rm -rf "$DEST/dist"
  cp -r "$DEST/dist.published.bak" "$DEST/dist"
  echo "Restored the published 0.0.3 build."
  exit 0
fi

[ -d "$PKG" ] || { echo "Package not found at $PKG (override with AGUI_PKG=...)"; exit 1; }

if [ ! -d "$PKG/node_modules" ]; then
  cat <<'MSG'
The ag-ui monorepo has no dependencies installed, so the package cannot build.
Run this once, from the ag-ui repo root:

    pnpm install

MSG
  exit 1
fi

echo "Building $PKG ..."
(cd "$PKG" && pnpm build)

# Keep a copy of the published build the first time, so --restore works.
[ -d "$DEST/dist.published.bak" ] || cp -r "$DEST/dist" "$DEST/dist.published.bak"

rm -rf "$DEST/dist"
cp -r "$PKG/dist" "$DEST/dist"
echo "Installed local build into $DEST/dist"
echo "Restart the backend (pnpm dev / npm run dev) to pick it up."
