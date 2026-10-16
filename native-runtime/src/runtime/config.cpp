#include "mc3/config.hpp"

#include "mc3/log.hpp"

#include <algorithm>
#include <cctype>
#include <cstdlib>
#include <string>
#include <vector>

namespace mc3 {
namespace {

std::filesystem::path env_path(const char* name) {
    if (const char* value = std::getenv(name); value && *value) {
        return std::filesystem::path(value);
    }
    return {};
}

void print_usage() {
    log_info(
        "Usage: mc3 [--game-data <directory-or-apk>] "
        "[--runtime-root <directory>] "
        "[--save-root <directory>] [--obb-root <directory>]"
    );
    log_info(
        "The game-data input may be an extracted APK directory or a "
        "Modern Combat 3 .apk containing lib/armeabi-v7a/libModernCombat3.so."
    );
    log_info(
        "If --game-data is omitted, mc3 will automatically scan the current "
        "folder and executable directory for ModernCombat3.apk or game assets."
    );
}

bool contains_mc3_library(const std::filesystem::path& dir) {
    std::error_code ec;
    if (!std::filesystem::is_directory(dir, ec)) return false;
    static constexpr const char* candidates[] = {
        "lib/armeabi-v7a/libModernCombat3.so",
        "lib/armeabi/libModernCombat3.so",
        "libModernCombat3.so"
    };
    for (const char* rel : candidates) {
        if (std::filesystem::is_regular_file(dir / rel, ec)) return true;
    }
    return false;
}

std::filesystem::path auto_discover_game_data(const std::filesystem::path& executable_path) {
    std::vector<std::filesystem::path> search_dirs;
    std::error_code ec;

    // 1. Current working directory
    const auto cwd = std::filesystem::current_path(ec);
    if (!ec && !cwd.empty()) {
        search_dirs.push_back(cwd);
    }

    // 2. Executable parent directory
    if (!executable_path.empty()) {
        const auto exe_dir = std::filesystem::absolute(executable_path, ec).parent_path();
        if (!ec && !exe_dir.empty()) {
            search_dirs.push_back(exe_dir);
        }
    }

    // 3. Common subdirectories
    const auto base_dirs = search_dirs;
    for (const auto& base : base_dirs) {
        static constexpr const char* subfolders[] = {
            "data", "game", "games", "apk", "mc3_data", "ModernCombat3", "game_data"
        };
        for (const char* sub : subfolders) {
            const auto subpath = base / sub;
            if (std::filesystem::is_directory(subpath, ec)) {
                search_dirs.push_back(subpath);
            }
        }
    }

    // Check each directory for an APK or extracted game folder
    for (const auto& dir : search_dirs) {
        if (contains_mc3_library(dir)) {
            return dir;
        }

        if (!std::filesystem::is_directory(dir, ec)) continue;

        std::filesystem::path candidate_apk;
        for (const auto& entry : std::filesystem::directory_iterator(dir, ec)) {
            if (ec) break;
            if (!entry.is_regular_file(ec)) continue;

            const auto ext = entry.path().extension().string();
            if (ext == ".apk" || ext == ".APK") {
                std::string lower_name = entry.path().filename().string();
                std::transform(lower_name.begin(), lower_name.end(), lower_name.begin(),
                               [](unsigned char c) { return static_cast<char>(std::tolower(c)); });

                if (lower_name.find("mc3") != std::string::npos ||
                    lower_name.find("modern") != std::string::npos ||
                    lower_name.find("combat") != std::string::npos ||
                    lower_name.find("gloft") != std::string::npos) {
                    return entry.path();
                }
                if (candidate_apk.empty()) {
                    candidate_apk = entry.path();
                }
            }
        }
        if (!candidate_apk.empty()) {
            return candidate_apk;
        }
    }

    return {};
}

std::filesystem::path auto_discover_obb_root(
    const std::filesystem::path& game_data,
    const std::filesystem::path& executable_path
) {
    std::vector<std::filesystem::path> search_dirs;
    std::error_code ec;

    if (!game_data.empty()) {
        search_dirs.push_back(game_data.parent_path());
        search_dirs.push_back(game_data.parent_path() / "obb");
        search_dirs.push_back(game_data.parent_path() / "com.gameloft.android.ANMP.GloftM3HM");
    }

    const auto cwd = std::filesystem::current_path(ec);
    if (!ec) {
        search_dirs.push_back(cwd);
        search_dirs.push_back(cwd / "obb");
        search_dirs.push_back(cwd / "data");
        search_dirs.push_back(cwd / "com.gameloft.android.ANMP.GloftM3HM");
    }

    if (!executable_path.empty()) {
        const auto exe_dir = std::filesystem::absolute(executable_path, ec).parent_path();
        if (!ec && !exe_dir.empty()) {
            search_dirs.push_back(exe_dir);
            search_dirs.push_back(exe_dir / "obb");
            search_dirs.push_back(exe_dir / "data");
        }
    }

    for (const auto& dir : search_dirs) {
        if (!std::filesystem::is_directory(dir, ec)) continue;
        for (const auto& entry : std::filesystem::directory_iterator(dir, ec)) {
            if (ec) break;
            const auto ext = entry.path().extension().string();
            if (ext == ".obb" || ext == ".OBB") {
                return dir;
            }
        }
    }

    return {};
}

} // namespace

std::filesystem::path default_runtime_root() {
    return std::filesystem::current_path() / "runtime";
}

std::filesystem::path default_save_root() {
    return std::filesystem::current_path() / "saves";
}

std::optional<Config> load_config(int argc, char** argv) {
    const std::filesystem::path exe_path = (argc > 0 && argv[0]) ? argv[0] : "";

    Config config{
        .game_data = env_path("MC3_GAME_DATA"),
        .obb_root = env_path("MC3_OBB_ROOT"),
        .runtime_root = env_path("MC3_RUNTIME_ROOT"),
        .save_root = env_path("MC3_SAVE_ROOT")
    };

    for (int i = 1; i < argc; ++i) {
        const std::string argument = argv[i];

        auto consume_path =
            [&](const char* flag, std::filesystem::path& destination) -> bool {
                if (argument != flag) {
                    return false;
                }
                if (i + 1 >= argc) {
                    log_error(std::string("Missing value for ") + flag);
                    return true;
                }
                destination = argv[++i];
                return true;
            };

        if (consume_path("--game-data", config.game_data)) continue;
        if (consume_path("--runtime-root", config.runtime_root)) continue;
        if (consume_path("--save-root", config.save_root)) continue;
        if (consume_path("--obb-root", config.obb_root)) continue;

        if (argument == "--help" || argument == "-h") {
            print_usage();
            return std::nullopt;
        }

        log_error(std::string("Unknown argument: ") + argument);
        print_usage();
        return std::nullopt;
    }

    // Auto-discover game data if not explicitly provided
    if (config.game_data.empty()) {
        const auto discovered = auto_discover_game_data(exe_path);
        if (!discovered.empty()) {
            config.game_data = discovered;
            log_info("Auto-discovered Modern Combat 3 game data: " + config.game_data.string());
        }
    }

    // Auto-discover OBB files if not specified
    if (config.obb_root.empty()) {
        const auto discovered_obb = auto_discover_obb_root(config.game_data, exe_path);
        if (!discovered_obb.empty()) {
            config.obb_root = discovered_obb;
            log_info("Auto-discovered Modern Combat 3 OBB directory: " + config.obb_root.string());
        }
    }

    if (config.runtime_root.empty()) {
        config.runtime_root = default_runtime_root();
    }

    if (config.save_root.empty()) {
        config.save_root = default_save_root();
    }

    if (config.game_data.empty()) {
        log_error("No MC3 game-data directory or APK was provided or found.");
        print_usage();
        return std::nullopt;
    }

    return config;
}

} // namespace mc3
