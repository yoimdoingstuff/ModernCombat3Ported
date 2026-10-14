# MC3 Ported: Native PC Translation Layer for Modern Combat 3 (Windows, macOS, Linux)

A native C++20 desktop translation layer and compatibility runtime for **Modern Combat 3: Fallen Nation** (Gameloft, 2011). It directly hosts the original Android ARMv7 binary (`libModernCombat3.so` v1.1.7g) on **Windows, macOS, and Linux** using Dynarmic JIT CPU translation, custom guest virtual memory, Android Bionic/POSIX/JNI shims, and an SDL3 platform abstraction layer. The user supplies their own authentic APK and OBB data files, with support for single-player campaign and **local multiplayer (both Local Wi-Fi / LAN and Local Bluetooth)**.

### User Review & Critical Decisions

> [!IMPORTANT]
> **Complete Translation Layer Architecture**: The engine is a lightweight, purpose-built Android translation layer running natively on desktop PC platforms. It does **not** install or ship an entire Android OS. Instead, it translates guest ARMv7 instructions, guest memory access, JNI call dispatch, and Android OS APIs (graphics, audio, filesystem, input, and networking) directly into host desktop equivalents. Users provide their own legal APK (`Modern-Combat-3-Fallen-Nation-v1-1-7g.apk`) and OBB expansion files (`main.1170.*.obb`). All web ports remain strictly disabled.

- **Confirmed Decision 1 (User-Supplied Game Data)**: The runtime extracts `libModernCombat3.so` into a small local cache and mounts assets directly from the user's provided APK/OBB archive on launch.
- **Confirmed Decision 2 (Multiplayer Scope)**: First-class support for **Local Wi-Fi (LAN UDP/TCP broadcast & lobby)** and **Local Bluetooth (Android BluetoothAdapter/RFCOMM translated to host Bluetooth / virtual bridge)**.
- **Confirmed Decision 3 (Platform Coverage)**: Native targets for **Windows (x86-64)**, **Linux (x86-64 / ARM64)**, and **macOS (Apple Silicon ARM64 / Intel x86-64)**.
- **Confirmed Decision 4 (Zero Touchscreen Overlay)**: Mouse and keyboard with direct camera aiming and gamepad controls replace mobile on-screen buttons completely.

---

### 1. Overview & Core Concept

- **What It Does**:
  1. **Game Data Ingestion Pipeline**: Ingests user-supplied `Modern-Combat-3-Fallen-Nation-v1-1-7g.apk` and `main.1170.com.gameloft.android.ANMP.GloftM3HM.obb`. Verifies CRC32/SHA checksums, extracts `lib/armeabi-v7a/libModernCombat3.so`, and exposes APK/OBB assets through an `AAssetManager` compatibility shim without inflating storage beyond 50 MB.
  2. **ARMv7 JIT Translation Layer**: Maps the 32-bit ELF shared library into a 4GB guest virtual address space, resolves ARM relocations (`R_ARM_RELATIVE`, `R_ARM_GLOB_DAT`, `R_ARM_JUMP_SLOT`), and translates A32/Thumb instructions dynamically to host x86-64 (or passes through native ARM64 instructions where supported) via Dynarmic.
  3. **Compatibility ABI & Shims**:
     - **Bionic libc / POSIX**: Memory allocation, threads (`pthread_create`, mutexes, semaphores), math, and standard I/O.
     - **Dynamic Linker (`dlfcn`)**: `dlopen`, `dlsym`, `dladdr` stubs for internal engine module lookup.
     - **Filesystem & State**: Virtualized paths redirecting Android internal storage (`/data/data/com.gameloft...`) and external storage (`/sdcard/Android/data/...`) to safe user application directories on PC (`%APPDATA%`, `~/.config`, `~/Library/Application Support`).
     - **FalsoJNI Dispatch**: Native JNI method tables implementing device info, battery status, sound volume, GL surface callbacks, and Gameloft lifecycle hooks.
  4. **Multiplayer Subsystem (Wi-Fi & Bluetooth)**:
     - **Local Wi-Fi / LAN**: Intercepts socket calls and Android networking classes to perform subnet UDP broadcast discovery (default port 2302/2303) and direct TCP/UDP peer session exchange for local multiplayer deathmatch and co-op matches.
     - **Local Bluetooth**: Translates Android `android.bluetooth.BluetoothAdapter`, `BluetoothDevice`, and `BluetoothSocket` (RFCOMM channel negotiation) to native desktop Bluetooth stacks (Windows Winsock Bluetooth, Linux BlueZ, macOS IOBluetooth) or an emulated local peer discovery bridge.
  5. **Platform Presentation**: SDL3 desktop windowing with resizable widescreen, unlocked framerates, 360° mouse aim, configurable keybindings, and low-latency audio via SDL3 audio streams.

- **Target Audience / Persona**: PC gamers, modders, and preservationists running Modern Combat 3: Fallen Nation on desktop operating systems with native PC performance and multiplayer.
- **Key Value**: A standalone, bloat-free translation layer running the original Android binary on PC with zero Android VM overhead and full local multiplayer compatibility.

---

### 2. User Experience & Desktop Presentation

- **Launcher CLI & Options**:
  ```bash
  # Run directly from user APK
  mc3 --game-data "C:\Games\MC3\Modern-Combat-3-Fallen-Nation-v1-1-7g.apk"

  # Run from extracted directory with explicit multiplayer interface
  mc3 --game-data "/path/to/extracted/mc3" --net-mode lan --resolution 1920x1080 --fps-limit 120

  # Inspect package assets and symbol requirements
  mc3inspect "C:\Games\MC3\Modern-Combat-3-Fallen-Nation-v1-1-7g.apk"
  ```
- **PC-Native Controls & HUD**:
  - Direct raw mouse camera look with configurable sensitivity and ADS zoom scaling.
  - Full keyboard mapping (WASD movement, Space jump/vault, Shift sprint, C crouch, R reload, G grenade, 1-4 weapons, Tab scoreboard).
  - Native controller support (Xbox, PlayStation, Nintendo Switch Pro) via SDL3 Gamepad API.
  - Complete suppression of mobile touch HUD buttons (no virtual d-pads or fire buttons rendered on screen).
- **Multiplayer Lobby & In-Game Experience**:
  - In-game "Local Wi-Fi" and "Bluetooth" menus function cleanly on PC.
  - LAN discovery automatically detects other PC instances on the local network (and cross-play compatible Android/iOS clients on the same subnet).
  - Bluetooth scan enumerates nearby paired or discoverable devices and initiates RFCOMM game sessions.

---

### 3. Key Technical Decisions & Architecture

- **Decision 1: Native Dynarmic A32 JIT vs Full Android Virtual Machine**
  - *Chosen Approach*: User-mode JIT translation layer hosting `libModernCombat3.so` in process memory.
  - *Why*: Starts in under a second, consumes negligible RAM (<100MB beyond game assets), requires no virtualization extensions, and runs natively across Windows, macOS, and Linux.
  - *Alternatives Considered*: QEMU Android VM, Waydroid, Bluestacks (heavy, 2-10 GB disk images, high CPU overhead, poor mouse integration).

- **Decision 2: Dual Network Transport for Local Multiplayer (Wi-Fi + Bluetooth)**
  - *Chosen Approach*:
    - **LAN/Wi-Fi**: Direct POSIX BSD socket mapping with broadcast enabling (`SO_BROADCAST`) and subnet IP reflection.
    - **Bluetooth**: Emulated Android RFCOMM driver mapping to native OS Bluetooth sockets (AF_BTH on Windows, AF_BLUETOOTH / RFCOMM on Linux BlueZ, and IOBluetooth on macOS) with fallback to local port pairing for testing.
  - *Why*: Perfectly reproduces the original MC3 local multiplayer menu options while enabling genuine wireless connectivity across PC and mobile peers.

- **Decision 3: Zero-Copy Asset Streaming via miniz**
  - *Chosen Approach*: Stream sound, textures, and models directly from the user's APK and OBB zip archives using `miniz` and an in-memory `AAssetManager` table. Only the native ELF library is cached to disk.
  - *Why*: Satisfies the strict <50MB overhead goal from `agents.md` without duplicating multi-gigabyte game files.

---

### 4. Technical Architecture & Milestone Roadmap

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           User-Supplied Game Data                               │
│        Modern-Combat-3-Fallen-Nation-v1-1-7g.apk   /   main.1170.*.obb          │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      Data Ingestion & Asset Streaming                           │
│  - apk_archive (miniz zip reader)       - obb_reader (expansion reader)         │
│  - game_data (path & version resolver)  - asset_manager (AAsset compatibility)  │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       MC3 ARMv7 Compatibility Runtime                           │
├────────────────────────────────────────┬────────────────────────────────────────┤
│  ARMv7 Execution & Memory              │  Compatibility ABI Shims               │
│  - Dynarmic A32 JIT Engine             │  - FalsoJNI & Gameloft JNI Dispatch    │
│  - 32-bit Guest Address Space (4GB)    │  - Bionic libc & pthreads              │
│  - ARM ELF Loader & Relocations        │  - Virtualized Android Filesystem      │
│  - Host Import Trampolines             │  - Dynamic Linker (dlopen/dlsym)       │
└────────────────────────────────────────┴────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       Networking & Multiplayer Subsystem                        │
├────────────────────────────────────────┬────────────────────────────────────────┤
│  Local Wi-Fi (LAN)                     │  Local Bluetooth (RFCOMM)              │
│  - BSD Socket Shims (TCP/UDP)          │  - Android BluetoothAdapter JNI        │
│  - Subnet Broadcast & Peer Discovery   │  - RFCOMM / SPP Protocol Translation   │
│  - Lobby & Match Session Coordinator   │  - Winsock AF_BTH / Linux BlueZ bridge │
└────────────────────────────────────────┴────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     Platform Hardware Abstraction Layer (HAL)                   │
├──────────────────────────┬─────────────────────────────┬────────────────────────┤
│  Graphics Translation    │  Audio & Sound              │  Input & Windowing     │
│  - EGL / GLES 2.0 Shim   │  - OpenSL ES Bridge         │  - SDL3 Window Manager │
│  - Desktop OpenGL / ANGLE│  - SDL3 Audio Stream        │  - Raw Mouse Look      │
│  - Framebuffer Swap      │  - 3D Positional Audio      │  - PC Keyboard/Gamepad │
└──────────────────────────┴─────────────────────────────┴────────────────────────┘
                                         │
         ┌───────────────────────────────┼───────────────────────────────┐
         ▼                               ▼                               ▼
┌──────────────────┐           ┌──────────────────┐           ┌──────────────────┐
│ Target: Windows  │           │  Target: Linux   │           │  Target: macOS   │
│ MSVC / Win32     │           │  GCC / Clang     │           │  Clang / Cocoa   │
└──────────────────┘           └──────────────────┘           └──────────────────┘
```

- **Phased Implementation Roadmap**:
  - **Milestone 1 (Foundation & Inspection Tooling)**:
    - Build system configuration (CMake 3.20+, C++20).
    - APK/OBB archive extraction and asset enumeration.
    - `mc3inspect` CLI tool for dynamic import analysis and checksum verification.
  - **Milestone 2 (ARM Execution & ELF Loading)**:
    - 32-bit ELF parser for `libModernCombat3.so`.
    - Virtual memory mapping and page protections (`PROT_READ`, `PROT_WRITE`, `PROT_EXEC`).
    - Dynarmic A32 JIT backend integration.
    - Relocation processing (`R_ARM_RELATIVE`, `R_ARM_GLOB_DAT`, `R_ARM_JUMP_SLOT`).
    - Trampoline table for external imports.
  - **Milestone 3 (ABI Shims & JNI Boot)**:
    - Bionic libc standard memory, string, and math functions.
    - POSIX thread primitives (`pthread_create`, `pthread_mutex_*`).
    - FalsoJNI method table and `JNI_OnLoad` initialization.
    - Android asset manager hooks reading data from APK/OBB.
  - **Milestone 4 (Graphics, Audio & Input Presentation)**:
    - SDL3 window creation and desktop event loop.
    - EGL context creation and OpenGL ES 2.0 command translation.
    - OpenSL ES audio playback via SDL3 audio callback streams.
    - Mouse look camera control and keyboard bindings replacing touch controls.
  - **Milestone 5 (Local Wi-Fi & Bluetooth Multiplayer)**:
    - BSD socket shims for LAN broadcast discovery and game matchmaking.
    - Bluetooth JNI bridge implementing `BluetoothAdapter` and RFCOMM client/server sockets.
    - End-to-end testing of 2-player and multi-player local matches.
