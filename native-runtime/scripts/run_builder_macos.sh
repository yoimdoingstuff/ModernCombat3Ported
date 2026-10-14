#!/usr/bin/env bash
# ========================================================
# MC3 Ported - Standalone Game Builder Launcher (macOS)
# ========================================================
set -e

if [ ! -f "build/mc3builder" ]; then
    echo "[INFO] Compiling mc3builder tool..."
    ./scripts/build_macos.sh
fi

echo "[LAUNCH] Starting MC3 Standalone Builder..."
./build/mc3builder "$@"
