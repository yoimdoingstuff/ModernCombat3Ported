#include "mc3/game_data.hpp"

#include "mc3/apk_archive.hpp"
#include "mc3/log.hpp"

#include <algorithm>
#include <filesystem>
#include <string>
#include <system_error>

namespace mc3 {
namespace {

constexpr const char* kMc3Library =
    "lib/armeabi-v7a/libModernCombat3.so";

std::optional<NativeLibraryInfo> find_armv7(
    const std::filesystem::path& root
) {
    static constexpr struct {
        const char* path;
        const char* abi;
    } candidates[] = {
        {"lib/armeabi-v7a/libModernCombat3.so", "armeabi-v7a"},
        {"lib/x86/libModernCombat3.so", "x86"},
        {"lib/armeabi/libModernCombat3.so", "armeabi"},
        {"libModernCombat3.so", "unknown-arm32"}
    };

    for (const auto& item : candidates) {
        const auto path = root / item.path;
        std::error_code ec;
        if (std::filesystem::is_regular_file(path, ec)) {
            const auto size = std::filesystem::file_size(path, ec);
            return NativeLibraryInfo{
                .path = path,
                .abi = item.abi,
                .size = ec ? 0 : size
            };
        }
    }

    return std::nullopt;
}

bool has_file(const std::filesystem::path& path) {
    std::error_code ec;
    return std::filesystem::is_regular_file(path, ec);
}

bool looks_like_apk(const std::filesystem::path& path) {
    return path.has_extension() &&
           path.extension() == ".apk";
}

std::filesystem::path find_obb_root(
    const std::filesystem::path& source_root
) {
    if (has_file(source_root / "main.obb") ||
        has_file(source_root / "patch.obb") ||
        has_file(
            source_root /
            "main.1120.com.gameloft.android.ANMP.GloftM3HM.obb"
        ) ||
        has_file(
            source_root /
            "patch.11428.com.gameloft.android.ANMP.GloftM3HM.obb"
        )) {
        return source_root;
    }

    return {};
}

} // namespace

std::optional<GameDataInfo> inspect_game_data(
    const std::filesystem::path& input,
    const std::filesystem::path& materialization_root
) {
    std::error_code ec;

    if (input.empty()) {
        log_error("MC3 game-data input is empty.");
        return std::nullopt;
    }

    GameDataInfo info;

    if (std::filesystem::is_regular_file(input, ec) && looks_like_apk(input)) {
        info.input_is_apk = true;
        info.source_apk = std::filesystem::weakly_canonical(input, ec);

        if (ec) {
            info.source_apk = input;
        }

        info.root = info.source_apk.value();

        const auto parent = info.source_apk.value().parent_path();
        info.obb_root = find_obb_root(parent);
        info.looks_like_obb_root = !info.obb_root.empty();

        if (!materialization_root.empty()) {
            std::filesystem::create_directories(materialization_root, ec);
            if (ec) {
                log_error(
                    "Failed to create APK materialization directory: " +
                    materialization_root.string() +
                    " (" + ec.message() + ")"
                );
                return std::nullopt;
            }

            const auto extracted =
                materialization_root / "libModernCombat3.so";

            static constexpr struct {
                const char* path;
                const char* abi;
            } kCandidateLibs[] = {
                {"lib/armeabi-v7a/libModernCombat3.so", "armeabi-v7a"},
                {"lib/x86/libModernCombat3.so", "x86"},
                {"lib/armeabi/libModernCombat3.so", "armeabi"},
                {"libModernCombat3.so", "unknown-arm32"}
            };

            const char* selected_entry = nullptr;
            const char* selected_abi = "armeabi-v7a";
            for (const auto& item : kCandidateLibs) {
                if (apk_contains_entry(input, item.path)) {
                    selected_entry = item.path;
                    selected_abi = item.abi;
                    break;
                }
            }

            if (!selected_entry) {
                log_error(
                    "MC3 native library (libModernCombat3.so) is missing from the APK. "
                    "Checked armeabi-v7a, x86, and armeabi."
                );
                return std::nullopt;
            }

            if (!std::filesystem::exists(extracted, ec)) {
                if (!extract_apk_entry(
                        input,
                        selected_entry,
                        extracted
                    )) {
                    return std::nullopt;
                }
            }

            auto size = std::filesystem::file_size(extracted, ec);
            if (ec || size == 0) {
                log_error(
                    "Materialized MC3 library has an invalid size."
                );
                return std::nullopt;
            }

            info.armv7_library = NativeLibraryInfo{
                .path = extracted,
                .abi = selected_abi,
                .size = size
            };

            log_info(std::string("Extracted MC3 library (") + selected_abi + ") from " + selected_entry);
            info.looks_like_apk_extract = true;
            return info;
        }

        static constexpr const char* kCandidateLibs[] = {
            "lib/armeabi-v7a/libModernCombat3.so",
            "lib/x86/libModernCombat3.so",
            "lib/armeabi/libModernCombat3.so",
            "libModernCombat3.so"
        };

        bool found_any = false;
        for (const auto* lib_path : kCandidateLibs) {
            if (apk_contains_entry(input, lib_path)) {
                found_any = true;
                log_info(std::string("APK contains MC3 native library: ") + lib_path);
                break;
            }
        }

        if (!found_any) {
            log_error(
                "MC3 native library is missing from the APK. "
                "Checked armeabi-v7a, x86, and armeabi."
            );
            return std::nullopt;
        }

        info.looks_like_apk_extract = true;
        return info;
    }

    if (!std::filesystem::exists(input, ec) ||
        !std::filesystem::is_directory(input, ec)) {
        log_error(
            "Game-data path does not exist or is not a directory: " +
            input.string()
        );
        return std::nullopt;
    }

    info.root = std::filesystem::weakly_canonical(input, ec);
    if (ec) {
        info.root = input;
    }

    info.armv7_library = find_armv7(input);
    info.obb_root = find_obb_root(input);
    info.looks_like_obb_root = !info.obb_root.empty();
    info.looks_like_apk_extract =
        has_file(input / "AndroidManifest.xml") ||
        std::filesystem::exists(input / "lib", ec);

    return info;
}

bool validate_game_data(const GameDataInfo& info) {
    if (!info.armv7_library) {
        if (info.input_is_apk) {
            log_error(
                "APK is valid but the MC3 ARM library has not been materialized."
            );
        } else {
            log_error(
                "MC3 native library was not found. Expected "
                "lib/armeabi-v7a/libModernCombat3.so."
            );
        }
        return false;
    }

    if (info.armv7_library->size == 0) {
        log_error(
            "MC3 native library exists but its size could not be read."
        );
        return false;
    }

    log_info(
        "Found MC3 ARM library: " +
        info.armv7_library->path.string()
    );
    log_info("ABI: " + info.armv7_library->abi);
    log_info(
        "Native library size: " +
        std::to_string(info.armv7_library->size) +
        " bytes"
    );

    if (info.looks_like_obb_root) {
        log_info(
            "Found MC3 OBB directory: " +
            info.obb_root.string()
        );
    } else {
        log_warning(
            "No MC3 OBB directory was detected next to the supplied game data."
        );
    }

    return true;
}

std::vector<std::filesystem::path> find_candidate_libraries(
    const std::filesystem::path& root
) {
    std::vector<std::filesystem::path> results;
    std::error_code ec;

    if (!std::filesystem::exists(root, ec)) {
        return results;
    }

    for (const auto& entry :
         std::filesystem::recursive_directory_iterator(root, ec)) {
        if (ec) {
            break;
        }

        if (!entry.is_regular_file(ec)) {
            continue;
        }

        if (entry.path().filename() == "libModernCombat3.so") {
            results.push_back(entry.path());
        }
    }

    std::sort(results.begin(), results.end());
    return results;
}

} // namespace mc3
