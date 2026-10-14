import React, { useState } from 'react';
import { 
  Terminal, 
  Copy, 
  Check, 
  FileCode, 
  Laptop, 
  Apple, 
  Cpu, 
  CheckCircle2, 
  HardDrive,
  FolderGit2
} from 'lucide-react';

export const NativeBuildTab: React.FC = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<'windows' | 'linux' | 'macos'>('windows');
  const [selectedFile, setSelectedFile] = useState<string>('multiplayer_hpp');
  const [copied, setCopied] = useState(false);

  const buildCommands = {
    windows: `# Windows (x86-64) Build with Visual Studio 2022
git clone https://github.com/yoimdoingstuff/mc3ported.git
cd mc3ported
cmake -B build -G "Visual Studio 17 2022" -A x64 -DMC3_ENABLE_DYNARMIC=ON -DMC3_ENABLE_TOOLS=ON
cmake --build build --config Release --parallel

# Run with your own APK
build\\bin\\Release\\mc3.exe --game-data "C:\\Games\\MC3\\Modern-Combat-3-Fallen-Nation-v1-1-7g.apk"`,

    linux: `# Linux (x86-64 / ARM64) Build with GCC/Clang
git clone https://github.com/yoimdoingstuff/mc3ported.git
cd mc3ported
cmake -B build -DCMAKE_BUILD_TYPE=Release -DMC3_ENABLE_DYNARMIC=ON -DMC3_ENABLE_TOOLS=ON
cmake --build build -j$(nproc)

# Run with your own APK
./build/mc3 --game-data ~/Games/MC3/Modern-Combat-3-Fallen-Nation-v1-1-7g.apk`,

    macos: `# macOS (Apple Silicon ARM64 / Intel) Build
git clone https://github.com/yoimdoingstuff/mc3ported.git
cd mc3ported
cmake -B build -DCMAKE_BUILD_TYPE=Release -DMC3_ENABLE_DYNARMIC=ON -DMC3_ENABLE_TOOLS=ON
cmake --build build -j$(sysctl -n hw.ncpu)

# Run with your own APK
./build/mc3 --game-data ~/Games/MC3/Modern-Combat-3-Fallen-Nation-v1-1-7g.apk`,
  };

  const codeFiles: Record<string, { title: string; lang: string; content: string }> = {
    multiplayer_hpp: {
      title: 'include/mc3/net/multiplayer.hpp',
      lang: 'cpp',
      content: `#pragma once

#include <cstdint>
#include <string>
#include <vector>
#include <functional>

namespace mc3::net {

enum class TransportMode {
    None,
    WifiLan,
    BluetoothRfcomm
};

enum class SessionRole {
    Idle,
    Host,
    Client
};

struct PeerDevice {
    std::string id;
    std::string name;
    std::string endpoint; // IP:port or Bluetooth MAC
    TransportMode transport = TransportMode::None;
    uint32_t ping_ms = 0;
    bool is_host = false;
    uint32_t player_count = 1;
    uint32_t max_players = 10;
    std::string match_map = "Alaska Submarine Base";
};

class MultiplayerManager {
public:
    static constexpr uint16_t DEFAULT_LAN_PORT = 2302;
    static constexpr const char* DEFAULT_BT_UUID = "00001101-0000-1000-8000-00805F9B34FB";

    MultiplayerManager();
    ~MultiplayerManager();

    bool initialize_wifi(uint16_t broadcast_port = DEFAULT_LAN_PORT);
    bool initialize_bluetooth(const std::string& service_uuid = DEFAULT_BT_UUID);
    void shutdown();

    bool start_discovery(TransportMode mode);
    void stop_discovery();

    bool host_session(TransportMode mode, const std::string& session_name, uint32_t max_players = 10);
    bool join_session(const PeerDevice& peer);
    void leave_session();

    bool send_packet(const void* data, size_t size, bool reliable = false);
    void poll_events();

    TransportMode active_transport() const { return active_transport_; }
    SessionRole session_role() const { return role_; }
    const std::vector<PeerDevice>& discovered_peers() const { return discovered_peers_; }

private:
    TransportMode active_transport_ = TransportMode::None;
    SessionRole role_ = SessionRole::Idle;
    bool discovering_ = false;
    uint16_t lan_port_ = DEFAULT_LAN_PORT;
    std::string bt_uuid_ = DEFAULT_BT_UUID;
    std::vector<PeerDevice> discovered_peers_;
};

} // namespace mc3::net`,
    },
    cmakelists: {
      title: 'CMakeLists.txt',
      lang: 'cmake',
      content: `cmake_minimum_required(VERSION 3.20)
project(mc3ported VERSION 0.1.0 LANGUAGES C CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

option(MC3_ENABLE_TESTS "Build MC3 Ported tests" ON)
option(MC3_ENABLE_TOOLS "Build MC3 Ported developer tools" ON)
option(MC3_ENABLE_DYNARMIC "Enable ARMv7 JIT backend" ON)

# Core Runtime Library
add_library(mc3_runtime
    src/runtime/config.cpp
    src/runtime/apk_archive.cpp
    src/runtime/game_data.cpp
    src/runtime/log.cpp
    src/runtime/arm/arm_runtime.cpp
    src/runtime/arm/guest_cpu.cpp
    src/runtime/arm/jni_bridge.cpp
    src/runtime/arm/android_fs_bridge.cpp
    src/runtime/arm/libc_bridge.cpp
    src/runtime/arm/dlfcn_bridge.cpp
    src/runtime/arm/asset_bridge.cpp
    src/runtime/arm/pthread_bridge.cpp
    src/runtime/net/multiplayer.cpp
    src/runtime/loader/elf32.cpp
    src/runtime/loader/imports.cpp
    src/runtime/loader/memory.cpp
)

target_include_directories(mc3_runtime PUBLIC \${CMAKE_CURRENT_SOURCE_DIR}/include)
target_link_libraries(mc3_runtime PUBLIC mc3_miniz)

# Target Executable
add_executable(mc3 src/main.cpp)
target_link_libraries(mc3 PRIVATE mc3_runtime)`,
    },
    build_win: {
      title: 'scripts/build_windows.bat',
      lang: 'bat',
      content: `@echo off
echo [MC3 Ported] Building for Windows (x86-64 MSVC)...
cmake -B build -G "Visual Studio 17 2022" -A x64 -DMC3_ENABLE_DYNARMIC=ON -DMC3_ENABLE_TOOLS=ON
cmake --build build --config Release --parallel
echo Output: build\\bin\\Release\\mc3.exe`,
    },
    build_linux: {
      title: 'scripts/build_linux.sh',
      lang: 'bash',
      content: `#!/usr/bin/env bash
set -e
echo "[MC3 Ported] Building for Linux (GCC/Clang)..."
cmake -B build -DCMAKE_BUILD_TYPE=Release -DMC3_ENABLE_DYNARMIC=ON -DMC3_ENABLE_TOOLS=ON
cmake --build build -j$(nproc)
echo Output: ./build/mc3`,
    },
  };

  const copyBuildScript = () => {
    navigator.clipboard.writeText(buildCommands[selectedPlatform]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Platform Selector Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 mt-1">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-sans">
                Native Desktop Build &amp; Source Pipeline (Windows · Linux · macOS)
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                The codebase is designed for pristine C++20 desktop compilation. Choose your target operating system below to copy the exact configuration and compile commands. All web game ports are strictly deferred.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setSelectedPlatform('windows')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                selectedPlatform === 'windows'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Windows (x64)</span>
            </button>

            <button
              onClick={() => setSelectedPlatform('linux')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                selectedPlatform === 'linux'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Linux</span>
            </button>

            <button
              onClick={() => setSelectedPlatform('macos')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                selectedPlatform === 'macos'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Apple className="w-3.5 h-3.5" />
              <span>macOS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Build Commands Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              Build Instructions for {selectedPlatform.toUpperCase()}
            </h3>
          </div>
          <button
            onClick={copyBuildScript}
            className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-medium font-mono"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied Commands!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy Instructions</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-amber-300/90 whitespace-pre-wrap select-all overflow-x-auto">
          {buildCommands[selectedPlatform]}
        </div>
      </div>

      {/* Native Source Code Explorer */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              C++20 Source Code Explorer (Native Compatibility Layer)
            </h3>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {Object.entries(codeFiles).map(([key, file]) => (
              <button
                key={key}
                onClick={() => setSelectedFile(key)}
                className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                  selectedFile === key
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {file.title.split('/').pop()}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[11px] font-mono text-slate-500 mb-1.5">
            Path: <span className="text-amber-400">{codeFiles[selectedFile].title}</span>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-300 whitespace-pre-wrap overflow-x-auto max-h-[380px] overflow-y-auto">
            {codeFiles[selectedFile].content}
          </div>
        </div>
      </div>
    </div>
  );
};
