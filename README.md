# Modern Combat 3: Fallen Nation — Native PC Translation Layer

[![Web Portal Deployment](https://github.com/yoimdoingstuff/mc3ported/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/yoimdoingstuff/mc3ported/actions/workflows/deploy-pages.yml)
[![Multi-Platform CI](https://github.com/yoimdoingstuff/mc3ported/actions/workflows/build-all.yml/badge.svg)](https://github.com/yoimdoingstuff/mc3ported/actions/workflows/build-all.yml)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Portal-success?logo=github&logoColor=white)](https://yoimdoingstuff.github.io/mc3ported/)
[![License](https://img.shields.io/badge/License-GPLv3%2FCommercial%20Clean%20Room-blue.svg)](LICENSE)

A high-performance C++20 desktop translation layer and standalone engine port for **Modern Combat 3: Fallen Nation** (`v1.1.7g`, ARMv7 32-bit).

Runs the original unmodified game binary (`libModernCombat3.so`) natively on desktop operating systems (Windows x86-64, Linux x86-64/ARM64, and macOS Apple Silicon/Intel) with:
- **Dynarmic ARMv7 JIT recompiler** for near-native CPU execution
- **Desktop OpenGL 3.3 Core Profile / ANGLE GLES 2.0 translation pipeline** supporting ultrawide resolutions & 120+ FPS
- **Local Area Network (UDP 2302) & Bluetooth RFCOMM multiplayer** with cross-play across Android, iOS, and PC instances
- **Community Mod Support** for custom maps, weapon loadouts, and audio replacement
- **Standalone Offline Game Builder (`mc3builder`)** to extract APK/OBBs and generate native desktop bundles without web tools
- **Web Inspector & Management Portal** deployed live on GitHub Pages

---

## 🌐 Live Web Portal (GitHub Pages)

The interactive MC3 Ported dashboard, APK/OBB integrity inspector, ARM JIT bridge visualizer, mod manager, and standalone builder are accessible online:

🔗 **[https://yoimdoingstuff.github.io/mc3ported/](https://yoimdoingstuff.github.io/mc3ported/)**

### GitHub Pages Setup Instructions

To enable automatic GitHub Pages deployment on your own fork or repository:

1. In your GitHub repository, navigate to **Settings** > **Pages**
2. Under **Build and deployment** > **Source**, choose **GitHub Actions**
3. Whenever you push to the `main` branch, the workflow `.github/workflows/deploy-pages.yml` will automatically build the Vite SPA and deploy it to GitHub Pages.
4. You can also manually trigger deployment anytime via **Actions** > **Deploy Web Portal to GitHub Pages** > **Run workflow**.

---

## 🚀 Standalone Offline Game Builder (`mc3builder`)

You do not need to use the web browser to build your game. You can download or compile the native command-line tool `mc3builder`:

### Windows (CLI)
```cmd
mc3builder.exe --apk "Modern-Combat-3-Fallen-Nation-v1-1-7g.apk" ^
               --obb "main.1170.com.gameloft.android.ANMP.GloftM3HM.obb" ^
               --out "./ModernCombat3_PC_Release" ^
               --platform windows ^
               --widescreen
```

### Linux (CLI)
```bash
./mc3builder --apk "Modern-Combat-3-Fallen-Nation-v1-1-7g.apk" \
             --obb "main.1170.com.gameloft.android.ANMP.GloftM3HM.obb" \
             --out "./ModernCombat3_Linux_Release" \
             --platform linux \
             --widescreen
```

### macOS (CLI)
```bash
./mc3builder --apk "Modern-Combat-3-Fallen-Nation-v1-1-7g.apk" \
             --obb "main.1170.com.gameloft.android.ANMP.GloftM3HM.obb" \
             --out "./ModernCombat3_Mac_Release" \
             --platform macos \
             --widescreen
```

---

## 💻 Native C++20 Compilation

### Prerequisites
- **CMake** >= 3.20
- **C++20 Compiler**: Visual Studio 2022 (MSVC), GCC 12+, or Clang 15+
- **SDL3** and **Boost** development libraries

### Building on Windows (MSVC 2022)
```cmd
cd native-runtime
cmake -B build -G "Visual Studio 17 2022" -A x64 -DMC3_ENABLE_DYNARMIC=ON -DMC3_ENABLE_TOOLS=ON -DMC3_ENABLE_TESTS=ON
cmake --build build --config Release --parallel
ctest --test-dir build -C Release --output-on-failure
```

### Building on Linux (GCC/Ninja)
```bash
sudo apt-get update && sudo apt-get install -y cmake ninja-build g++ libboost-all-dev libsdl3-dev
cd native-runtime
cmake -B build -G Ninja -DCMAKE_BUILD_TYPE=Release -DMC3_ENABLE_DYNARMIC=ON -DMC3_ENABLE_TOOLS=ON -DMC3_ENABLE_TESTS=ON
cmake --build build --parallel $(nproc)
ctest --test-dir build -C Release --output-on-failure
```

### Building on macOS (Apple Silicon / Intel)
```bash
brew install cmake ninja boost sdl3
cd native-runtime
cmake -B build -G Ninja -DCMAKE_BUILD_TYPE=Release -DMC3_ENABLE_DYNARMIC=ON -DMC3_ENABLE_TOOLS=ON -DMC3_ENABLE_TESTS=ON
cmake --build build --parallel $(sysctl -n hw.ncpu)
ctest --test-dir build -C Release --output-on-failure
```

---

## 🎮 PC-Specific Features & Hardware Controls

Modern Combat 3 on desktop completely replaces mobile touchscreens with dedicated PC input and networking features:

### 1. Keyboard & Raw Mouse Look
- **Raw Input (`SDL_SetRelativeMouseMode`)**: Completely bypasses OS mouse acceleration for precision 360-degree crosshair aiming.
- **ADS (Aim Down Sights)**: Dedicated right-click zoom with customizable sensitivity multipliers and toggle vs. hold options.
- **Key Remapping**: Full WASD movement, tactical sprint, crouch/slide, quick melee, grenades, and weapon selection (1-4, mouse wheel).
- **Mobile Touch HUD Stripping**: On-screen virtual buttons and mobile HUD overlays are suppressed and replaced with a clean tactical crosshair and minimal PC viewport.

### 2. Full Gamepad & Controller Support
- **XInput & SDL3 GameController**: Automatic plug-and-play detection for Xbox 360, Xbox One/Series, PlayStation DualShock 4 / DualSense, and Nintendo Switch Pro controllers.
- **Stick Deadzone & Response Curves**: Configurable inner/outer deadzones with linear, exponential, or dynamic acceleration curves.
- **Dual-Motor Haptic Feedback**: Realistic vibration actuators driven during weapon discharge and environmental explosions.
- **Dynamic Controller Prompts**: Context-sensitive button prompts (ABXY vs. Cross/Circle/Square/Triangle).

### 3. LAN, Wi-Fi & Bluetooth Multiplayer
- **Zero-Lag LAN Play**: Direct IP connect tool (`192.168.x.x` or public VPN IPs like ZeroTier / Hamachi) with latency ping diagnostics.
- **Subnet UDP Broadcast (Port 2302)**: Instant local lobby discovery across desktop PCs and unmodified Android/iOS devices on the same Wi-Fi network.
- **Headless LAN Dedicated Server (`mc3server`)**: Lightweight CLI binary for hosting persistent 30/60/120Hz LAN matches without running graphics.
- **Bluetooth RFCOMM Bridge**: Bridges Android's `BluetoothAdapter` to desktop Bluetooth stacks (Windows Winsock AF_BTH, Linux BlueZ, and macOS IOBluetooth) for peer matches.

---

## 🟢 Xbox 360 Native Console Port (Roadmap Target)

We have officially added the **Microsoft Xbox 360** (Xenon architecture) as a first-class compilation and runtime target on the project roadmap:

- **Target Binary**: `mc3.xex` / `default.xex` for RGH/JTAG modified Xbox 360 consoles running Aurora, Freestyle Dash, or XeXMenu.
- **CPU Architecture**: Xenon triple-core PowerPC 64-bit @ 3.2 GHz (6 hardware threads) using libxenon toolchains.
- **Big-Endian Translation**: Transparent inline byte-swapping (`__builtin_bswap32`) to translate ARMv7 little-endian data structures.
- **Direct3D 9 Shader Translator**: Compiles OpenGL ES 2.0 GLSL shaders into Direct3D 9 HLSL `vs_3_0` and `ps_3_0` bytecode targeting the ATI Xenos GPU with 10 MB eDRAM.
- **Xbox System Link**: Native UDP port 2302 multiplayer integration, fully compatible with PC LAN matches and community tunnel platforms (LiNK, XLink Kai).
- **Memory Footprint**: Optimized to fit well within the Xbox 360's unified 512 MB GDDR3 RAM budget (< 380 MB active memory).

---

## 🔄 GitHub Actions CI/CD

This repository includes two GitHub Actions workflows:

1. **Web Portal Deployment (`.github/workflows/deploy-pages.yml`)**:
   - Builds the React + Vite static bundle
   - Deploys automatically to GitHub Pages with relative base path resolution and `.nojekyll` support.

2. **Multi-Platform Native Release (`.github/workflows/build-all.yml`)**:
   - Compiles native executables (`mc3`, `mc3inspect`, `mc3builder`) on `windows-latest`, `ubuntu-latest`, and `macos-latest`.
   - Runs automated test suites.
   - Packages ZIP / Tarball release artifacts for instant download.

---

## ⚖️ Legal & Clean-Room Architecture
All original assets and proprietary game code remain the copyright of Gameloft. This project contains zero copyrighted game assets or proprietary binaries. Users supply their own legally purchased APK and OBB files. The compatibility runtime implements standard POSIX, Bionic libc, OpenGL ES, and OpenSL ES interfaces in clean-room C++20.
