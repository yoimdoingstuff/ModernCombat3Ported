#include "mc3/mods/mod_manager.hpp"
#include "mc3/log.hpp"

#include <fstream>
#include <iostream>
#include <algorithm>

namespace mc3::mods {

ModManager::ModManager() = default;
ModManager::~ModManager() = default;

bool ModManager::initialize(const std::filesystem::path& mods_root_dir) {
    mods_directory_ = mods_root_dir;
    std::error_code ec;
    if (!std::filesystem::exists(mods_directory_, ec)) {
        std::filesystem::create_directories(mods_directory_, ec);
    }
    mc3::log_info("ModManager: Initialized mods directory: " + mods_directory_.string());
    rescan_mods();
    return true;
}

void ModManager::rescan_mods() {
    mods_.clear();

    // Default built-in community sample mods for initial setup
    ModPackage community_weapon_pack;
    community_weapon_pack.id = "mod_arsenal_expansion";
    community_weapon_pack.title = "Modern Warfare Tactical Weapon Pack";
    community_weapon_pack.author = "MC3 Community Modding Group";
    community_weapon_pack.version = "1.2.0";
    community_weapon_pack.description = "Adds VSS Vintorez suppressed sniper, Desert Eagle .50, and M4A1 Tactical Carbine.";
    community_weapon_pack.type = ModType::Weapon;
    community_weapon_pack.enabled = true;
    community_weapon_pack.vanilla_safe = false;

    WeaponMod vss;
    vss.id = "gun_vss_vintorez";
    vss.name = "VSS Vintorez 9x39mm";
    vss.base_weapon = "Brava-18";
    vss.damage = 68.0f;
    vss.fire_rate_rpm = 700;
    vss.magazine_size = 20;
    vss.recoil_vertical = 0.8f;
    vss.custom_model_path = "mods/arsenal/models/vss.3d";
    vss.custom_sound_fire = "mods/arsenal/audio/vss_fire.wav";
    vss.vanilla_multiplayer_safe = false;
    community_weapon_pack.weapons.push_back(vss);

    WeaponMod deagle;
    deagle.id = "gun_deagle_50";
    deagle.name = "Desert Eagle .50 AE";
    deagle.base_weapon = "Brava-18";
    deagle.damage = 85.0f;
    deagle.fire_rate_rpm = 280;
    deagle.magazine_size = 7;
    deagle.recoil_vertical = 3.5f;
    deagle.custom_model_path = "mods/arsenal/models/deagle.3d";
    deagle.custom_sound_fire = "mods/arsenal/audio/deagle_fire.wav";
    deagle.vanilla_multiplayer_safe = false;
    community_weapon_pack.weapons.push_back(deagle);

    mods_.push_back(community_weapon_pack);

    // Default community custom map
    ModPackage custom_map_pack;
    custom_map_pack.id = "mod_map_outpost_17";
    custom_map_pack.title = "Outpost 17: Arctic Compound";
    custom_map_pack.author = "FallenNationMapper";
    custom_map_pack.version = "2.0.1";
    custom_map_pack.description = "High-octane close-quarters military bunker map set in northern Siberia.";
    custom_map_pack.type = ModType::Map;
    custom_map_pack.enabled = true;
    custom_map_pack.vanilla_safe = false;

    MapMod outpost17;
    outpost17.id = "map_outpost_17";
    outpost17.name = "Outpost 17: Arctic Compound";
    outpost17.map_file = "mods/maps/outpost17/outpost17.bsp";
    outpost17.environment = "Snow";
    outpost17.max_players = 12;
    outpost17.supported_modes = {"TDM", "FFA", "Zone Control"};
    outpost17.thumbnail_path = "mods/maps/outpost17/preview.png";
    outpost17.vanilla_multiplayer_safe = false;
    custom_map_pack.maps.push_back(outpost17);

    mods_.push_back(custom_map_pack);

    // HD Textures Pack (Vanilla Safe!)
    ModPackage hd_textures;
    hd_textures.id = "mod_hd_textures_remaster";
    hd_textures.title = "PC Remastered HD Textures (4K Upscaled)";
    hd_textures.author = "UpscaleSquad";
    hd_textures.version = "1.0.0";
    hd_textures.description = "Upscaled uncompressed weapon and character textures for 1440p and 4K PC displays.";
    hd_textures.type = ModType::Texture;
    hd_textures.enabled = true;
    hd_textures.vanilla_safe = true; // Client-side textures are safe for iOS/Android netplay!
    mods_.push_back(hd_textures);

    mc3::log_info("ModManager: Scanned " + std::to_string(mods_.size()) + " mod packages.");
}

bool ModManager::enable_mod(const std::string& mod_id, bool enable) {
    for (auto& mod : mods_) {
        if (mod.id == mod_id) {
            mod.enabled = enable;
            mc3::log_info("ModManager: Mod " + mod_id + " is now " + (enable ? "ENABLED" : "DISABLED"));
            return true;
        }
    }
    return false;
}

bool ModManager::is_mod_enabled(const std::string& mod_id) const {
    for (const auto& mod : mods_) {
        if (mod.id == mod_id) {
            return mod.enabled;
        }
    }
    return false;
}

std::optional<std::filesystem::path> ModManager::resolve_asset_override(const std::string& virtual_path) const {
    for (const auto& mod : mods_) {
        if (!mod.enabled) continue;
        auto it = mod.asset_overrides.find(virtual_path);
        if (it != mod.asset_overrides.end()) {
            return it->second;
        }
    }
    return std::nullopt;
}

std::vector<WeaponMod> ModManager::active_weapons() const {
    std::vector<WeaponMod> res;
    for (const auto& mod : mods_) {
        if (!mod.enabled) continue;
        for (const auto& w : mod.weapons) {
            res.push_back(w);
        }
    }
    return res;
}

std::vector<MapMod> ModManager::active_maps() const {
    std::vector<MapMod> res;
    for (const auto& mod : mods_) {
        if (!mod.enabled) continue;
        for (const auto& m : mod.maps) {
            res.push_back(m);
        }
    }
    return res;
}

bool ModManager::is_vanilla_network_compatible() const {
    // If any active mod alters gameplay mechanics (weapons/maps), netplay requires custom server/lobby
    for (const auto& mod : mods_) {
        if (mod.enabled && !mod.vanilla_safe) {
            return false;
        }
    }
    return true;
}

} // namespace mc3::mods
