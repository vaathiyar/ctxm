#!/usr/bin/env bash
# Installs ctxm skills into Claude Code's global skills directory.
# Safe to re-run — removes old ctxm folders first.
set -euo pipefail

DEFAULT_DEST="$HOME/.claude/skills"
read -rp "Skills directory [leave empty for $DEFAULT_DEST]: " DEST
DEST="${DEST:-$DEFAULT_DEST}"

CTXM_DIR="$(cd "$(dirname "$0")" && pwd)"

rm -rf "$DEST"/ctxm-* "$DEST"/shared
mkdir -p "$DEST"
cp -r "$CTXM_DIR/skills/cc/"* "$DEST"/
echo "ctxm installed to $DEST/"
