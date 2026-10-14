@echo off
REM ========================================================
REM MC3 Ported - Standalone Game Builder Launcher (Windows)
REM ========================================================

if not exist build\bin\Release\mc3builder.exe (
    echo [INFO] Compiling mc3builder tool...
    call scripts\build_windows.bat
)

if not exist build\bin\Release\mc3builder.exe (
    echo [ERROR] mc3builder binary could not be found.
    exit /b 1
)

echo [LAUNCH] Starting MC3 Standalone Builder...
build\bin\Release\mc3builder.exe %*
