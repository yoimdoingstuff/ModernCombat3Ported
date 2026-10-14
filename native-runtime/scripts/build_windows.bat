@echo off
REM MC3 Ported - Windows Native Build Script (MSVC / Visual Studio 2022)
echo ========================================================
echo MC3 Ported - Native Windows Translation Layer Build
echo Modern Combat 3: Fallen Nation (ARMv7 to x86-64 Dynarmic)
echo ========================================================

where cmake >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] CMake not found in PATH. Please install CMake 3.20+
    exit /b 1
)

if not exist build mkdir build

echo [1/2] Configuring CMake for Visual Studio 2022 (x64)...
cmake -B build -G "Visual Studio 17 2022" -A x64 -DMC3_ENABLE_DYNARMIC=ON -DMC3_ENABLE_TOOLS=ON -DMC3_ENABLE_TESTS=ON

if %ERRORLEVEL% neq 0 (
    echo [ERROR] CMake configuration failed.
    exit /b %ERRORLEVEL%
)

echo [2/2] Compiling Release binaries...
cmake --build build --config Release --parallel

if %ERRORLEVEL% neq 0 (
    echo [ERROR] Build failed.
    exit /b %ERRORLEVEL%
)

echo ========================================================
echo Build Successful!
echo Executable: build\bin\Release\mc3.exe
echo Inspector:  build\bin\Release\mc3inspect.exe
echo Run:        build\bin\Release\mc3.exe --game-data "Path\To\Modern-Combat-3.apk"
echo ========================================================
