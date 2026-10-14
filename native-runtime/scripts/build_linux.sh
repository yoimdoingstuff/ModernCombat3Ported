#!/usr/bin/env bash
# MC3 Ported - Linux Native Build Script (GCC / Clang)
set -e

echo "========================================================"
echo "MC3 Ported - Native Linux Translation Layer Build"
echo "Modern Combat 3: Fallen Nation (ARMv7 on Linux)"
echo "========================================================"

command -v cmake >/dev/null 2>&1 || { echo "[ERROR] CMake 3.20+ is required."; exit 1; }

mkdir -p build
echo "[1/2] Configuring CMake..."
cmake -B build \
    -DCMAKE_BUILD_TYPE=Release \
    -DMC3_ENABLE_DYNARMIC=ON \
    -DMC3_ENABLE_TOOLS=ON \
    -DMC3_ENABLE_TESTS=ON

NPROC=$(nproc 2>/dev/null || echo 4)
echo "[2/2] Compiling with $NPROC parallel jobs..."
cmake --build build -j"$NPROC"

echo "========================================================"
echo "Build Successful!"
echo "Executable: ./build/mc3"
echo "Inspector:  ./build/mc3inspect"
echo "Run:        ./build/mc3 --game-data /path/to/Modern-Combat-3.apk"
echo "========================================================"
