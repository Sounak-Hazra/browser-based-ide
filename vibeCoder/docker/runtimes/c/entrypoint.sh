#!/bin/bash
set -euo pipefail

WORKSPACE_ROOT="/workspace"
TARGET_DIR="$WORKSPACE_ROOT/$PROJECT_ID/"

mkdir -p "$TARGET_DIR"
cd "$TARGET_DIR"

# If CMD env variable exists → run it
if [ -n "${CMD:-}" ]; then
  bash -lc "$CMD"
  exit $?
fi

# If arguments are passed → execute them
if [ $# -gt 0 ]; then
  exec "$@"
fi

# Otherwise keep container running
tail -f /dev/null
