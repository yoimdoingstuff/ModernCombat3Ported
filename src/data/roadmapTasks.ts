export type TaskStatus = 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED';

export interface PhaseTask {
  id: string;
  phaseId: number;
  phaseTitle: string;
  category: 'Foundation' | 'Core Runtime' | 'Android ABI' | 'Platform & Graphics' | 'PC Input & Controls' | 'Multiplayer' | 'Mods & Tools' | 'Xbox 360 Port';
  title: string;
  status: TaskStatus;
  notes?: string;
}

export const ALL_ROADMAP_TASKS: PhaseTask[] = [
  // Phase 0: Project foundation
  { id: 'p0-1', phaseId: 0, phaseTitle: 'Phase 0: Project Foundation', category: 'Foundation', title: 'Create project architecture and agent guidance', status: 'COMPLETED' },
  { id: 'p0-2', phaseId: 0, phaseTitle: 'Phase 0: Project Foundation', category: 'Foundation', title: 'Define user-supplied game-data workflow', status: 'COMPLETED' },
  { id: 'p0-3', phaseId: 0, phaseTitle: 'Phase 0: Project Foundation', category: 'Foundation', title: 'Define sub-100 MB runtime-overhead goal (target < 50 MB)', status: 'COMPLETED' },
  { id: 'p0-4', phaseId: 0, phaseTitle: 'Phase 0: Project Foundation', category: 'Foundation', title: 'Add CMake multi-platform project skeleton', status: 'COMPLETED' },
  { id: 'p0-5', phaseId: 0, phaseTitle: 'Phase 0: Project Foundation', category: 'Foundation', title: 'Add initial CI build matrix for runtime (Linux, Windows, macOS)', status: 'COMPLETED' },
  { id: 'p0-6', phaseId: 0, phaseTitle: 'Phase 0: Project Foundation', category: 'Foundation', title: 'Add formatting and static-analysis configuration', status: 'COMPLETED' },
  { id: 'p0-7', phaseId: 0, phaseTitle: 'Phase 0: Project Foundation', category: 'Foundation', title: 'Add structured runtime logging system (MC3_LOG)', status: 'COMPLETED' },
  { id: 'p0-8', phaseId: 0, phaseTitle: 'Phase 0: Project Foundation', category: 'Foundation', title: 'Add .gitignore for builds, caches, and runtime data', status: 'COMPLETED' },

  // Phase 1: Reference game/data pipeline
  { id: 'p1-1', phaseId: 1, phaseTitle: 'Phase 1: Game Data Pipeline', category: 'Foundation', title: 'Document supported MC3 Android package (v1.1.7g GloftM3HM)', status: 'COMPLETED' },
  { id: 'p1-2', phaseId: 1, phaseTitle: 'Phase 1: Game Data Pipeline', category: 'Foundation', title: 'Add game-data inspection tool (mc3inspect)', status: 'COMPLETED' },
  { id: 'p1-3', phaseId: 1, phaseTitle: 'Phase 1: Game Data Pipeline', category: 'Foundation', title: 'Add APK/ZIP asset enumeration via miniz', status: 'COMPLETED' },
  { id: 'p1-4', phaseId: 1, phaseTitle: 'Phase 1: Game Data Pipeline', category: 'Foundation', title: 'Add OBB discovery, mount pathing, and CRC32 validation', status: 'COMPLETED' },
  { id: 'p1-5', phaseId: 1, phaseTitle: 'Phase 1: Game Data Pipeline', category: 'Foundation', title: 'Add configurable game-data directory (--game-data flag)', status: 'COMPLETED' },
  { id: 'p1-6', phaseId: 1, phaseTitle: 'Phase 1: Game Data Pipeline', category: 'Foundation', title: 'Validate ARM ABI and native library presence (armeabi-v7a)', status: 'COMPLETED' },
  { id: 'p1-7', phaseId: 1, phaseTitle: 'Phase 1: Game Data Pipeline', category: 'Foundation', title: 'Detect libModernCombat3.so automatically in APK archive', status: 'COMPLETED' },
  { id: 'p1-8', phaseId: 1, phaseTitle: 'Phase 1: Game Data Pipeline', category: 'Foundation', title: 'Add clean error reporting when game data is missing', status: 'COMPLETED' },
  { id: 'p1-9', phaseId: 1, phaseTitle: 'Phase 1: Game Data Pipeline', category: 'Foundation', title: 'Enforce legal boundary: proprietary assets remain user-supplied', status: 'COMPLETED' },
  { id: 'p1-10', phaseId: 1, phaseTitle: 'Phase 1: Game Data Pipeline', category: 'Foundation', title: 'Add binary file validation utility (ZIP magic, version codes)', status: 'COMPLETED' },

  // Phase 2: ARMv7 execution & Dynarmic JIT
  { id: 'p2-1', phaseId: 2, phaseTitle: 'Phase 2: ARMv7 Execution & JIT', category: 'Core Runtime', title: 'Evaluate ARMv7 user-mode translation options', status: 'COMPLETED' },
  { id: 'p2-2', phaseId: 2, phaseTitle: 'Phase 2: ARMv7 Execution & JIT', category: 'Core Runtime', title: 'Select Dynarmic A32 as x86-64 / ARM64 JIT CPU backend', status: 'COMPLETED' },
  { id: 'p2-3', phaseId: 2, phaseTitle: 'Phase 2: ARMv7 Execution & JIT', category: 'Core Runtime', title: 'Integrate Dynarmic CMake dependency and headers', status: 'COMPLETED' },
  { id: 'p2-4', phaseId: 2, phaseTitle: 'Phase 2: ARMv7 Execution & JIT', category: 'Core Runtime', title: 'Add ARMv7 execution smoke test in test suite', status: 'COMPLETED' },
  { id: 'p2-5', phaseId: 2, phaseTitle: 'Phase 2: ARMv7 Execution & JIT', category: 'Core Runtime', title: 'Implement 32-bit ARM ELF parsing and PT_LOAD mapping', status: 'COMPLETED' },
  { id: 'p2-6', phaseId: 2, phaseTitle: 'Phase 2: ARMv7 Execution & JIT', category: 'Core Runtime', title: 'Inspect PT_DYNAMIC dependencies, symbols, and relocations', status: 'COMPLETED' },
  { id: 'p2-7', phaseId: 2, phaseTitle: 'Phase 2: ARMv7 Execution & JIT', category: 'Core Runtime', title: 'Apply R_ARM_RELATIVE relocations during load', status: 'COMPLETED' },
  { id: 'p2-8', phaseId: 2, phaseTitle: 'Phase 2: ARMv7 Execution & JIT', category: 'Core Runtime', title: 'Add mc3inspect dynamic-import reporting', status: 'COMPLETED' },
  { id: 'p2-9', phaseId: 2, phaseTitle: 'Phase 2: ARMv7 Execution & JIT', category: 'Core Runtime', title: 'Implement ARM ELF loading into live Dynarmic guest CPU', status: 'COMPLETED' },
  { id: 'p2-10', phaseId: 2, phaseTitle: 'Phase 2: ARMv7 Execution & JIT', category: 'Core Runtime', title: 'Implement 4GB flat guest virtual memory mappings', status: 'COMPLETED' },
  { id: 'p2-11', phaseId: 2, phaseTitle: 'Phase 2: ARMv7 Execution & JIT', category: 'Core Runtime', title: 'Implement R_ARM_GLOB_DAT and R_ARM_JUMP_SLOT relocations', status: 'COMPLETED' },
  { id: 'p2-12', phaseId: 2, phaseTitle: 'Phase 2: ARMv7 Execution & JIT', category: 'Core Runtime', title: 'Add diagnostics for unresolved imports with return stubs', status: 'COMPLETED' },
  { id: 'p2-13', phaseId: 2, phaseTitle: 'Phase 2: ARMv7 Execution & JIT', category: 'Core Runtime', title: 'Load original MC3 native library through custom loader', status: 'COMPLETED' },
  { id: 'p2-14', phaseId: 2, phaseTitle: 'Phase 2: ARMv7 Execution & JIT', category: 'Core Runtime', title: 'Reach JNI_OnLoad entry point execution in guest memory', status: 'COMPLETED' },
  { id: 'p2-15', phaseId: 2, phaseTitle: 'Phase 2: ARMv7 Execution & JIT', category: 'Core Runtime', title: 'Verify standalone startup without Android OS installed', status: 'COMPLETED' },

  // Phase 3: Dynamic loading & Bionic ABI
  { id: 'p3-1', phaseId: 3, phaseTitle: 'Phase 3: Dynamic Loading & ABI', category: 'Android ABI', title: 'Implement dlopen compatibility shim for guest modules', status: 'COMPLETED' },
  { id: 'p3-2', phaseId: 3, phaseTitle: 'Phase 3: Dynamic Loading & ABI', category: 'Android ABI', title: 'Implement dlsym symbol resolution trampoline', status: 'COMPLETED' },
  { id: 'p3-3', phaseId: 3, phaseTitle: 'Phase 3: Dynamic Loading & ABI', category: 'Android ABI', title: 'Implement dlclose and dlerror error handling', status: 'COMPLETED' },
  { id: 'p3-4', phaseId: 3, phaseTitle: 'Phase 3: Dynamic Loading & ABI', category: 'Android ABI', title: 'Map Bionic libc symbols (malloc, free, memcpy, memset, strcmp)', status: 'COMPLETED' },
  { id: 'p3-5', phaseId: 3, phaseTitle: 'Phase 3: Dynamic Loading & ABI', category: 'Android ABI', title: 'Map POSIX pthread symbols (pthread_create, mutex, cond_var)', status: 'COMPLETED' },
  { id: 'p3-6', phaseId: 3, phaseTitle: 'Phase 3: Dynamic Loading & ABI', category: 'Android ABI', title: 'Map time and clock functions (clock_gettime, gettimeofday)', status: 'COMPLETED' },
  { id: 'p3-7', phaseId: 3, phaseTitle: 'Phase 3: Dynamic Loading & ABI', category: 'Android ABI', title: 'Map Bionic dlmalloc heap and address reservation (0x90000000)', status: 'COMPLETED' },
  { id: 'p3-8', phaseId: 3, phaseTitle: 'Phase 3: Dynamic Loading & ABI', category: 'Android ABI', title: 'Add missing-symbol logging with caller address backtraces', status: 'COMPLETED' },
  { id: 'p3-9', phaseId: 3, phaseTitle: 'Phase 3: Dynamic Loading & ABI', category: 'Android ABI', title: 'Add ARM EABI helper functions (__aeabi_idiv, __aeabi_ldivmod)', status: 'COMPLETED' },
  { id: 'p3-10', phaseId: 3, phaseTitle: 'Phase 3: Dynamic Loading & ABI', category: 'Android ABI', title: 'Add host-address trampoline call gates for guest functions', status: 'COMPLETED' },

  // Phase 4: Minimal Android environment (JNI & Filesystem)
  { id: 'p4-1', phaseId: 4, phaseTitle: 'Phase 4: Minimal Android Shims', category: 'Android ABI', title: 'Minimal JNI runtime with JavaVM* and JNIEnv* virtual tables', status: 'COMPLETED' },
  { id: 'p4-2', phaseId: 4, phaseTitle: 'Phase 4: Minimal Android Shims', category: 'Android ABI', title: 'FalsoJNI class and method lookup dispatch', status: 'COMPLETED' },
  { id: 'p4-3', phaseId: 4, phaseTitle: 'Phase 4: Minimal Android Shims', category: 'Android ABI', title: 'JNI string creation and primitive value conversions', status: 'COMPLETED' },
  { id: 'p4-4', phaseId: 4, phaseTitle: 'Phase 4: Minimal Android Shims', category: 'Android ABI', title: 'JNI byte array and object reference table allocation', status: 'COMPLETED' },
  { id: 'p4-5', phaseId: 4, phaseTitle: 'Phase 4: Minimal Android Shims', category: 'Android ABI', title: 'Implement Gameloft engine lifecycle callbacks (onSurfaceCreated)', status: 'COMPLETED' },
  { id: 'p4-6', phaseId: 4, phaseTitle: 'Phase 4: Minimal Android Shims', category: 'Android ABI', title: 'Map logical Android internal paths (/data/data/... to AppData)', status: 'COMPLETED' },
  { id: 'p4-7', phaseId: 4, phaseTitle: 'Phase 4: Minimal Android Shims', category: 'Android ABI', title: 'Map external storage and OBB directory (/sdcard/Android/obb)', status: 'COMPLETED' },
  { id: 'p4-8', phaseId: 4, phaseTitle: 'Phase 4: Minimal Android Shims', category: 'Android ABI', title: 'Sandboxed I/O preventing unauthorized writes outside game root', status: 'COMPLETED' },
  { id: 'p4-9', phaseId: 4, phaseTitle: 'Phase 4: Minimal Android Shims', category: 'Android ABI', title: 'AAssetManager compatibility: open/read/seek/close streamed assets', status: 'COMPLETED' },
  { id: 'p4-10', phaseId: 4, phaseTitle: 'Phase 4: Minimal Android Shims', category: 'Android ABI', title: 'Zero-copy direct asset decompression from user APK/OBB archive', status: 'COMPLETED' },

  // Phase 5: Graphics & PC Windowing (SDL3)
  { id: 'p5-1', phaseId: 5, phaseTitle: 'Phase 5: Graphics & Display', category: 'Platform & Graphics', title: 'SDL3 desktop window creation for Windows, Linux, and macOS', status: 'COMPLETED' },
  { id: 'p5-2', phaseId: 5, phaseTitle: 'Phase 5: Graphics & Display', category: 'Platform & Graphics', title: 'EGL display and surface initialization shims', status: 'COMPLETED' },
  { id: 'p5-3', phaseId: 5, phaseTitle: 'Phase 5: Graphics & Display', category: 'Platform & Graphics', title: 'Desktop OpenGL Core 3.3 / ANGLE translation context', status: 'COMPLETED' },
  { id: 'p5-4', phaseId: 5, phaseTitle: 'Phase 5: Graphics & Display', category: 'Platform & Graphics', title: 'OpenGL ES 2.0 command passthrough and shader translation', status: 'COMPLETED' },
  { id: 'p5-5', phaseId: 5, phaseTitle: 'Phase 5: Graphics & Display', category: 'Platform & Graphics', title: 'Double-buffered swap chain and frame pacing', status: 'COMPLETED' },
  { id: 'p5-6', phaseId: 5, phaseTitle: 'Phase 5: Graphics & Display', category: 'Platform & Graphics', title: 'Widescreen 16:9 and 21:9 ultrawide viewport scaling', status: 'COMPLETED' },
  { id: 'p5-7', phaseId: 5, phaseTitle: 'Phase 5: Graphics & Display', category: 'Platform & Graphics', title: 'V-Sync toggle and 60 / 120 / 144 / unlocked FPS limits', status: 'COMPLETED' },
  { id: 'p5-8', phaseId: 5, phaseTitle: 'Phase 5: Graphics & Display', category: 'Platform & Graphics', title: 'In-game 3D rendering pipeline verification', status: 'COMPLETED' },

  // Phase 6: Audio Subsystem
  { id: 'p6-1', phaseId: 6, phaseTitle: 'Phase 6: Audio Subsystem', category: 'Platform & Graphics', title: 'OpenSL ES audio interface translation to SDL3 audio streams', status: 'COMPLETED' },
  { id: 'p6-2', phaseId: 6, phaseTitle: 'Phase 6: Audio Subsystem', category: 'Platform & Graphics', title: 'Low-latency PCM buffer queue feeding and mixing', status: 'COMPLETED' },
  { id: 'p6-3', phaseId: 6, phaseTitle: 'Phase 6: Audio Subsystem', category: 'Platform & Graphics', title: 'Master volume and SFX channel control', status: 'COMPLETED' },
  { id: 'p6-4', phaseId: 6, phaseTitle: 'Phase 6: Audio Subsystem', category: 'Platform & Graphics', title: '3D spatial audio positional sound emulation', status: 'COMPLETED' },

  // Phase 7: PC Input & Controls (No Touchscreen HUD)
  { id: 'p7-1', phaseId: 7, phaseTitle: 'Phase 7: PC Input & Controls', category: 'PC Input & Controls', title: 'Raw mouse delta input for 360-degree camera aiming', status: 'COMPLETED' },
  { id: 'p7-2', phaseId: 7, phaseTitle: 'Phase 7: PC Input & Controls', category: 'PC Input & Controls', title: 'Keyboard WASD movement and tactical bindings', status: 'COMPLETED' },
  { id: 'p7-3', phaseId: 7, phaseTitle: 'Phase 7: PC Input & Controls', category: 'PC Input & Controls', title: 'Suppress and disable mobile touch HUD and on-screen buttons on PC', status: 'COMPLETED' },
  { id: 'p7-4', phaseId: 7, phaseTitle: 'Phase 7: PC Input & Controls', category: 'PC Input & Controls', title: 'SDL3 Gamepad API integration (Xbox, PlayStation, Switch Pro)', status: 'COMPLETED' },
  { id: 'p7-5', phaseId: 7, phaseTitle: 'Phase 7: PC Input & Controls', category: 'PC Input & Controls', title: 'Configurable mouse sensitivity and ADS zoom scaling in mc3.ini', status: 'COMPLETED' },
  { id: 'p7-6', phaseId: 7, phaseTitle: 'Phase 7: PC Input & Controls', category: 'PC Input & Controls', title: 'Custom key rebinding engine with secondary binds and modifier keys', status: 'COMPLETED' },
  { id: 'p7-7', phaseId: 7, phaseTitle: 'Phase 7: PC Input & Controls', category: 'PC Input & Controls', title: 'Gamepad thumbstick deadzones, acceleration curves, and invert-Y', status: 'COMPLETED' },
  { id: 'p7-8', phaseId: 7, phaseTitle: 'Phase 7: PC Input & Controls', category: 'PC Input & Controls', title: 'Dual-rumble motor haptic feedback via XInput & SDL3 GameController', status: 'COMPLETED' },
  { id: 'p7-9', phaseId: 7, phaseTitle: 'Phase 7: PC Input & Controls', category: 'PC Input & Controls', title: 'Context-sensitive button prompts (Xbox ABXY vs PlayStation symbols)', status: 'COMPLETED' },

  // Phase 8: Local Multiplayer (LAN, Wi-Fi & Bluetooth)
  { id: 'p8-1', phaseId: 8, phaseTitle: 'Phase 8: Local Multiplayer', category: 'Multiplayer', title: 'UDP subnet broadcast discovery on port 2302 (mc3/net/multiplayer.hpp)', status: 'COMPLETED' },
  { id: 'p8-2', phaseId: 8, phaseTitle: 'Phase 8: Local Multiplayer', category: 'Multiplayer', title: 'Peer-to-peer session handshake and lobby creation', status: 'COMPLETED' },
  { id: 'p8-3', phaseId: 8, phaseTitle: 'Phase 8: Local Multiplayer', category: 'Multiplayer', title: 'Android BluetoothAdapter JNI emulation for local RFCOMM SPP', status: 'COMPLETED' },
  { id: 'p8-4', phaseId: 8, phaseTitle: 'Phase 8: Local Multiplayer', category: 'Multiplayer', title: 'Desktop OS Bluetooth stack bridge (Winsock AF_BTH / BlueZ / IOBluetooth)', status: 'COMPLETED' },
  { id: 'p8-5', phaseId: 8, phaseTitle: 'Phase 8: Local Multiplayer', category: 'Multiplayer', title: 'Cross-play compatibility testing with unmodified iOS/Android clients', status: 'COMPLETED' },
  { id: 'p8-6', phaseId: 8, phaseTitle: 'Phase 8: Local Multiplayer', category: 'Multiplayer', title: '60 Hz netcode tick delta synchronization and packet framing', status: 'COMPLETED' },
  { id: 'p8-7', phaseId: 8, phaseTitle: 'Phase 8: Local Multiplayer', category: 'Multiplayer', title: 'Direct IP connection and port routing for LAN and VPN networks', status: 'COMPLETED' },
  { id: 'p8-8', phaseId: 8, phaseTitle: 'Phase 8: Local Multiplayer', category: 'Multiplayer', title: 'Headless LAN dedicated server mode (mc3server) for hosting matches', status: 'COMPLETED' },
  { id: 'p8-9', phaseId: 8, phaseTitle: 'Phase 8: Local Multiplayer', category: 'Multiplayer', title: 'Wi-Fi Direct / Ad-hoc P2P discovery protocol emulation', status: 'COMPLETED' },

  // Phase 9: Mod Support & Standalone Builder
  { id: 'p9-1', phaseId: 9, phaseTitle: 'Phase 9: Mod Support & Tools', category: 'Mods & Tools', title: 'ModManager engine with asset interception via AAssetManager_open', status: 'COMPLETED' },
  { id: 'p9-2', phaseId: 9, phaseTitle: 'Phase 9: Mod Support & Tools', category: 'Mods & Tools', title: 'Custom community weapon injection (damage, RPM, recoil, audio)', status: 'COMPLETED' },
  { id: 'p9-3', phaseId: 9, phaseTitle: 'Phase 9: Mod Support & Tools', category: 'Mods & Tools', title: 'Custom BSP map loader and game mode binding (TDM, FFA, CTF)', status: 'COMPLETED' },
  { id: 'p9-4', phaseId: 9, phaseTitle: 'Phase 9: Mod Support & Tools', category: 'Mods & Tools', title: 'Vanilla netplay compatibility isolation (cosmetic vs modded lobby)', status: 'COMPLETED' },
  { id: 'p9-5', phaseId: 9, phaseTitle: 'Phase 9: Mod Support & Tools', category: 'Mods & Tools', title: 'Standalone mc3builder desktop CLI utility (tools/mc3builder/main.cpp)', status: 'COMPLETED' },
  { id: 'p9-6', phaseId: 9, phaseTitle: 'Phase 9: Mod Support & Tools', category: 'Mods & Tools', title: 'Multi-platform GitHub Actions CI matrix for Windows, Linux, macOS', status: 'COMPLETED' },
  { id: 'p9-7', phaseId: 9, phaseTitle: 'Phase 9: Mod Support & Tools', category: 'Mods & Tools', title: 'Automated release packaging scripts (build_windows.bat, build_linux.sh)', status: 'COMPLETED' },

  // Phase 10: Xbox 360 Port (Xenon PowerPC 64-bit Target)
  { id: 'p10-1', phaseId: 10, phaseTitle: 'Phase 10: Xbox 360 Port (Xenon/D3D9)', category: 'Xbox 360 Port', title: 'Xenon PowerPC 64-bit cross-compilation toolchain setup (libxenon)', status: 'COMPLETED' },
  { id: 'p10-2', phaseId: 10, phaseTitle: 'Phase 10: Xbox 360 Port (Xenon/D3D9)', category: 'Xbox 360 Port', title: 'Big-Endian PowerPC translation layer for ARMv7 little-endian memory layout', status: 'IN_PROGRESS' },
  { id: 'p10-3', phaseId: 10, phaseTitle: 'Phase 10: Xbox 360 Port (Xenon/D3D9)', category: 'Xbox 360 Port', title: 'Direct3D 9 / HLSL shader translation pipeline for OpenGL ES 2.0 shaders', status: 'IN_PROGRESS' },
  { id: 'p10-4', phaseId: 10, phaseTitle: 'Phase 10: Xbox 360 Port (Xenon/D3D9)', category: 'Xbox 360 Port', title: 'Xenos GPU 10 MB EDRAM tiling buffer & 720p resolve rendering pass', status: 'NOT_STARTED' },
  { id: 'p10-5', phaseId: 10, phaseTitle: 'Phase 10: Xbox 360 Port (Xenon/D3D9)', category: 'Xbox 360 Port', title: 'Native Xbox 360 XInput controller driver & Guide button handling', status: 'COMPLETED' },
  { id: 'p10-6', phaseId: 10, phaseTitle: 'Phase 10: Xbox 360 Port (Xenon/D3D9)', category: 'Xbox 360 Port', title: 'XAudio2 5.1 surround sound audio pipeline implementation', status: 'IN_PROGRESS' },
  { id: 'p10-7', phaseId: 10, phaseTitle: 'Phase 10: Xbox 360 Port (Xenon/D3D9)', category: 'Xbox 360 Port', title: 'Xbox 360 System Link multiplayer packet protocol bridge for LAN / LiNK / XLink Kai', status: 'NOT_STARTED' },
  { id: 'p10-8', phaseId: 10, phaseTitle: 'Phase 10: Xbox 360 Port (Xenon/D3D9)', category: 'Xbox 360 Port', title: 'Memory optimization targeting 512 MB unified GDDR3 RAM budget (< 380 MB active)', status: 'NOT_STARTED' },
  { id: 'p10-9', phaseId: 10, phaseTitle: 'Phase 10: Xbox 360 Port (Xenon/D3D9)', category: 'Xbox 360 Port', title: 'Homebrew / Aurora / Freestyle dash compatible mc3.xex packaging & title update metadata', status: 'NOT_STARTED' },
];

export function getRoadmapStatistics() {
  const total = ALL_ROADMAP_TASKS.length;
  const completed = ALL_ROADMAP_TASKS.filter((t) => t.status === 'COMPLETED').length;
  const inProgress = ALL_ROADMAP_TASKS.filter((t) => t.status === 'IN_PROGRESS').length;
  const notStarted = ALL_ROADMAP_TASKS.filter((t) => t.status === 'NOT_STARTED').length;

  const percentComplete = Math.round((completed / total) * 100);
  const percentActive = Math.round((inProgress / total) * 100);
  const percentRemaining = 100 - percentComplete;

  // Category breakdowns
  const categories = [
    'Foundation', 
    'Core Runtime', 
    'Android ABI', 
    'Platform & Graphics', 
    'PC Input & Controls',
    'Multiplayer', 
    'Mods & Tools',
    'Xbox 360 Port'
  ] as const;

  const categoryStats = categories.map((cat) => {
    const catTasks = ALL_ROADMAP_TASKS.filter((t) => t.category === cat);
    const catDone = catTasks.filter((t) => t.status === 'COMPLETED').length;
    const catTotal = catTasks.length;
    const pct = catTotal > 0 ? Math.round((catDone / catTotal) * 100) : 0;
    return {
      category: cat,
      total: catTotal,
      completed: catDone,
      percent: pct,
    };
  });

  return {
    total,
    completed,
    inProgress,
    notStarted,
    percentComplete,
    percentActive,
    percentRemaining,
    categoryStats,
  };
}
