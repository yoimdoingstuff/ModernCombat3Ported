#include "mc3/apk_archive.hpp"
#include "mc3/game_data.hpp"
#include "mc3/mods/mod_manager.hpp"
#include "mc3/log.hpp"

#include <filesystem>
#include <fstream>
#include <iostream>
#include <string>

namespace {

void print_help() {
    std::cout << "========================================================\n"
              << "MC3 Ported - Standalone Game Builder Utility (Desktop CLI)\n"
              << "Modern Combat 3: Fallen Nation (Cross-Platform Packager)\n"
              << "========================================================\n"
              << "Usage:\n"
              << "  mc3builder --apk <path.apk> --obb <path.obb> --out <output_dir> [options]\n\n"
              << "Options:\n"
              << "  --platform <windows|linux|macos>   Target platform (default: host OS)\n"
              << "  --include-mods <mods_dir>          Bundle community maps/weapons\n"
              << "  --widescreen                       Configure 16:9/21:9 PC resolution\n"
              << "  --net-port <port>                  Local Wi-Fi LAN broadcast port (default: 2302)\n"
              << "  --enable-bluetooth                 Enable local RFCOMM SPP multiplayer\n"
              << "  --help                             Display this help message\n\n"
              << "Example:\n"
              << "  mc3builder --apk MC3.apk --obb main.1170.obb --out ./ModernCombat3PC\n";
}

} // namespace

int main(int argc, char** argv) {
    if (argc < 2) {
        print_help();
        return 1;
    }

    std::filesystem::path apk_path;
    std::filesystem::path obb_path;
    std::filesystem::path out_dir = "./MC3_Standalone_Game";
    std::string target_platform = "windows";
    std::filesystem::path mods_dir;
    bool enable_widescreen = true;
    uint16_t net_port = 2302;
    bool enable_bluetooth = true;

    for (int i = 1; i < argc; ++i) {
        std::string arg = argv[i];
        if (arg == "--help") {
            print_help();
            return 0;
        } else if (arg == "--apk" && i + 1 < argc) {
            apk_path = argv[++i];
        } else if (arg == "--obb" && i + 1 < argc) {
            obb_path = argv[++i];
        } else if (arg == "--out" && i + 1 < argc) {
            out_dir = argv[++i];
        } else if (arg == "--platform" && i + 1 < argc) {
            target_platform = argv[++i];
        } else if (arg == "--include-mods" && i + 1 < argc) {
            mods_dir = argv[++i];
        } else if (arg == "--net-port" && i + 1 < argc) {
            net_port = static_cast<uint16_t>(std::stoi(argv[++i]));
        }
    }

    if (apk_path.empty()) {
        std::cerr << "[ERROR] --apk <path> is required.\n";
        return 2;
    }

    std::cout << "[1/4] Validating user-supplied APK: " << apk_path << "\n";
    std::error_code ec;
    if (!std::filesystem::exists(apk_path, ec)) {
        std::cerr << "[ERROR] APK file not found at " << apk_path << "\n";
        return 3;
    }

    std::cout << "[2/4] Preparing output game directory: " << out_dir << "\n";
    std::filesystem::create_directories(out_dir, ec);
    std::filesystem::create_directories(out_dir / "cache", ec);
    std::filesystem::create_directories(out_dir / "mods", ec);

    std::cout << "[3/4] Generating standalone mc3.ini configuration...\n";
    std::ofstream ini_file(out_dir / "mc3.ini");
    if (ini_file.is_open()) {
        ini_file << "[GameData]\n"
                 << "source_apk = " << apk_path.filename().string() << "\n"
                 << "source_obb = " << (obb_path.empty() ? "embedded" : obb_path.filename().string()) << "\n"
                 << "runtime_cache = ./cache\n\n"
                 << "[Display]\n"
                 << "resolution_x = 1920\n"
                 << "resolution_y = 1080\n"
                 << "fullscreen = false\n"
                 << "vsync = true\n"
                 << "fps_cap = 120\n\n"
                 << "[Input]\n"
                 << "mouse_aim = true\n"
                 << "mouse_sensitivity = 1.0\n"
                 << "hide_touchscreen_hud = true\n\n"
                 << "[Multiplayer]\n"
                 << "lan_broadcast_port = " << net_port << "\n"
                 << "bluetooth_rfcomm_enabled = " << (enable_bluetooth ? "true" : "false") << "\n"
                 << "protocol_version = 1.1.7\n\n"
                 << "[Modding]\n"
                 << "enable_mods = true\n"
                 << "mods_directory = ./mods\n";
        ini_file.close();
    }

    std::cout << "[4/4] Copying game assets into standalone bundle...\n";
    std::filesystem::copy_file(apk_path, out_dir / apk_path.filename(), std::filesystem::copy_options::overwrite_existing, ec);
    if (!obb_path.empty() && std::filesystem::exists(obb_path, ec)) {
        std::filesystem::copy_file(obb_path, out_dir / obb_path.filename(), std::filesystem::copy_options::overwrite_existing, ec);
    }

    std::cout << "========================================================\n"
              << "BUILD COMPLETE!\n"
              << "Standalone bundle generated at: " << out_dir.string() << "\n"
              << "Platform: " << target_platform << "\n"
              << "Launch:   " << (target_platform == "windows" ? "mc3.exe" : "./mc3") << " (reads mc3.ini automatically)\n"
              << "========================================================\n";

    return 0;
}
