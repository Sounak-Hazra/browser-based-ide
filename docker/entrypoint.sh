#!/bin/bash
set -euo pipefail

WORKSPACE_ROOT="/workspace"
TARGET_DIR="$WORKSPACE_ROOT/$USER_ID/$PROJECT_ID/$RUN_ID"

mkdir -p "$TARGET_DIR"
cd "$TARGET_DIR"

# If CMD environment variable is set → execute it
if [ -n "${CMD:-}" ]; then
  echo "=========================================="
  echo "🏗️ Workspace prepared"
  echo "👤 User: $USER_ID"
  echo "📁 Project: $PROJECT_ID"
  echo "🆔 Run: $RUN_ID"
  echo "🚀 Executing command: $CMD"
  echo "=========================================="

  bash -lc "$CMD"
  EXIT_CODE=$?

  echo "=========================================="
  echo "✅ Execution complete (exit code: $EXIT_CODE)"
  echo "=========================================="

  exit $EXIT_CODE
fi

# If arguments were passed from CMD in Docker → run them
if [ $# -gt 0 ]; then
  echo "⚙️ Executing container CMD arguments: $@"
  exec "$@"
else
  echo "🐳 No CMD or arguments provided — keeping container alive..."
  tail -f /dev/null
fi
