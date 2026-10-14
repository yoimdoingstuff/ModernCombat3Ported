#pragma once

#include <cstdint>
#include <string>
#include <vector>
#include <unordered_map>
#include <filesystem>
#include <optional>
#include <memory>

namespace mc3::mods {

enum class ModType {
    Weapon,
    Map,
    Audio,
    Texture,
    TotalConversion
};

struct WeaponMod {
    std::string id;
    std::string name;
    std::string base_weapon; // e.g. "Brava-18", "MC-4", "Bravel-1"
    float damage = 35.0f;
    uint32_t fire_rate_rpm = 650;
    uint32_t magazine_size = 30;
    float recoil_vertical = 1.2f;
    std::string custom_model_path;
    std::string custom_sound_fire;
    bool vanilla_multiplayer_safe = false; // true if purely client-side audio/texture
};

struct MapMod {
    std::string id;
    std::string name;
    std::string map_file; // e.g. "outpost17.bsp"
    std::string environment; // "Desert", "Urban", "Snow", "Jungle"
    uint32_t max_players = 12;
    std::vector<std::string> supported_modes; // "TDM", "FFA", "CTF"
    std::string thumbnail_path;
    bool vanilla_multiplayer_safe = false; // Maps require custom lobby
};

struct ModPackage {
    std::string id;
    std::string title;
    std::string author;
    std::string version;
    std::string description;
    ModType type = ModType::Weapon;
    bool enabled = true;
    std::filesystem::path root_directory;
    std::unordered_map<std::string, std::filesystem::path> asset_overrides;
    std::vector<WeaponMod> weapons;
    std::vector<MapMod> maps;
    bool vanilla_safe = false;
};

class ModManager {
public:
    ModManager();
    ~ModManager();

    bool initialize(const std::filesystem::path& mods_root_dir);
    void rescan_mods();

    bool enable_mod(const std::string& mod_id, bool enable = true);
    bool is_mod_enabled(const std::string& mod_id) const;

    // Asset interception: checks if a requested path is overridden by an active mod
    std::optional<std::filesystem::path> resolve_asset_override(const std::string& virtual_path) const;

    const std::vector<ModPackage>& loaded_mods() const { return mods_; }
    std::vector<WeaponMod> active_weapons() const;
    std::vector<MapMod> active_maps() const;

    // Checks if the current mod configuration is safe for standard iOS/Android cross-play
    bool is_vanilla_network_compatible() const;

private:
    std::filesystem::path mods_directory_;
    std::vector<ModPackage> mods_;
};

} // namespace mc3::mods
