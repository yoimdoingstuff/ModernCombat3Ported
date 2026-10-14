#include "mc3/arm/arm_runtime.hpp"
#include "mc3/config.hpp"
#include "mc3/game_data.hpp"
#include "mc3/log.hpp"
#include "mc3/platform/sdl_platform.hpp"
#include "mc3/input/input_manager.hpp"
#include "mc3/audio/audio_engine.hpp"
#include "mc3/mods/mod_manager.hpp"
#include "mc3/net/multiplayer.hpp"

#include <filesystem>

int main(int argc, char** argv) {
    mc3::log_info("MC3 Ported runtime bootstrap");
    mc3::log_info("M1: game-data discovery + ARM runtime interface");

    const auto config = mc3::load_config(argc, argv);
    if (!config) {
        return 2;
    }

    std::error_code ec;
    std::filesystem::create_directories(config->runtime_root, ec);
    if (ec) {
        mc3::log_error(
            "Failed to create runtime directory: " +
            config->runtime_root.string() +
            " (" + ec.message() + ")"
        );
        return 3;
    }

    std::filesystem::create_directories(config->save_root, ec);
    if (ec) {
        mc3::log_error(
            "Failed to create save directory: " +
            config->save_root.string() +
            " (" + ec.message() + ")"
        );
        return 3;
    }

    const auto data = mc3::inspect_game_data(
        config->game_data,
        config->runtime_root / "apk-cache"
    );

    if (!data || !mc3::validate_game_data(*data)) {
        mc3::log_error("MC3 game-data validation failed.");
        return 4;
    }

    mc3::arm::ArmRuntime arm_runtime;

    const auto obb_root =
        data->looks_like_obb_root
            ? data->obb_root
            : (config->obb_root.empty() ? std::filesystem::path{} : config->obb_root);

    if (!arm_runtime.configure_assets(
            config->runtime_root / "data" / "assets",
            data->source_apk.value_or(std::filesystem::path{}),
            obb_root
        )) {
        mc3::log_error("Android AssetManager configuration failed.");
        return 5;
    }

    if (!arm_runtime.configure_filesystem(
            obb_root,
            config->save_root / "appdata",
            config->save_root / "external",
            config->runtime_root / "data"
        )) {
        mc3::log_error("Android filesystem configuration failed.");
        return 5;
    }
    if (!arm_runtime.initialize()) {
        mc3::log_error("ARM runtime initialization failed.");
        return 5;
    }

    if (data->armv7_library &&
        !arm_runtime.load_library(data->armv7_library->path)) {
        mc3::log_error(
            "MC3 ARM library could not be loaded into the guest runtime."
        );
        return 6;
    }

    if (!arm_runtime.bootstrap_jni()) {
        mc3::log_error("MC3 JNI bootstrap failed.");
        return 7;
    }

    // Initialize Community ModManager
    mc3::mods::ModManager mod_manager;
    mod_manager.initialize(config->runtime_root / "mods");
    mc3::log_info("ModManager: Loaded " + std::to_string(mod_manager.loaded_mods().size()) + " community mods.");

    // Initialize Native Platform & SDL3 Window
    mc3::platform::SdlPlatform platform;
    mc3::platform::WindowConfig win_cfg;
    win_cfg.title = "Modern Combat 3: Fallen Nation (PC Port)";
    win_cfg.width = 1920;
    win_cfg.height = 1080;
    win_cfg.fullscreen = false;
    win_cfg.vsync = true;
    win_cfg.fps_limit = 120;
    if (!platform.initialize(win_cfg)) {
        mc3::log_error("Failed to initialize SDL3 desktop window.");
        return 8;
    }

    // Verify In-Game 3D Rendering Pipeline (GLES 2.0 -> OpenGL Core 3.3 Translation)
    if (!platform.verify_3d_render_pipeline()) {
        mc3::log_error("3D rendering pipeline verification failed.");
        return 9;
    }

    // Initialize PC Input Subsystem (Suppressing Mobile Touch Overlays)
    mc3::input::InputManager input_manager;
    input_manager.initialize(1.0f);

    // Wire platform input callbacks directly to PC input translation layer
    platform.set_keyboard_callback([&input_manager](int scancode, bool pressed) {
        input_manager.on_key_event(scancode, pressed);
    });
    platform.set_mouse_motion_callback([&input_manager](float dx, float dy) {
        input_manager.on_mouse_motion(dx, dy);
    });
    platform.set_mouse_button_callback([&input_manager](int button, bool pressed) {
        input_manager.on_mouse_button(button, pressed);
    });

    // Initialize Audio Engine with 3D Spatial Audio Emulation
    mc3::audio::AudioEngine audio_engine;
    mc3::audio::AudioConfig audio_cfg;
    audio_cfg.spatial_audio_enabled = true;
    audio_engine.initialize(audio_cfg);
    audio_engine.set_listener_transform({0.0f, 1.7f, 0.0f}, {0.0f, 0.0f, 1.0f}, {0.0f, 1.0f, 0.0f});

    // Initialize Local Multiplayer Subsystem (Wi-Fi LAN + Bluetooth)
    mc3::net::MultiplayerManager multiplayer_manager;
    multiplayer_manager.initialize_wifi(2302);
    multiplayer_manager.initialize_bluetooth();

    mc3::log_info("MC3 Ported: Engine loop active. Running Modern Combat 3 native translation layer.");

    // Execution loop: poll platform events, tick multiplayer, execute ARMv7 frame, swap buffers
    while (platform.is_running()) {
        platform.poll_events();
        input_manager.update();
        multiplayer_manager.poll_events();

        // Advance Modern Combat 3 native game state via Java_com_gameloft_glf_GL2JNILib_step
        arm_runtime.step_game();

        // Reset per-frame input deltas
        input_manager.reset_frame_deltas();

        // Swap display buffers & pace frame rate
        platform.swap_buffers();
        platform.delay_frame(win_cfg.fps_limit);
    }

    mc3::log_info("MC3 Ported: Clean shutdown completed.");
    return 0;
}
