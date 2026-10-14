#pragma once

#include <cstdint>
#include <string>
#include <memory>
#include <functional>

namespace mc3::platform {

struct WindowConfig {
    std::string title = "Modern Combat 3: Fallen Nation";
    uint32_t width = 1920;
    uint32_t height = 1080;
    bool fullscreen = false;
    bool vsync = true;
    uint32_t fps_limit = 120;
    bool capture_mouse = true;
};

class SdlPlatform {
public:
    SdlPlatform();
    ~SdlPlatform();

    bool initialize(const WindowConfig& config);
    void shutdown();

    bool poll_events();
    void swap_buffers();
    void delay_frame(uint32_t target_fps);

    // 3D Rendering Pipeline Verification
    bool verify_3d_render_pipeline();

    bool is_running() const { return running_; }
    void request_exit() { running_ = false; }

    uint32_t width() const { return width_; }
    uint32_t height() const { return height_; }
    float aspect_ratio() const { return static_cast<float>(width_) / static_cast<float>(height_); }

    void set_relative_mouse_mode(bool enabled);
    void set_keyboard_callback(std::function<void(int scancode, bool pressed)> cb) {
        on_key_ = std::move(cb);
    }
    void set_mouse_motion_callback(std::function<void(float delta_x, float delta_y)> cb) {
        on_mouse_move_ = std::move(cb);
    }
    void set_mouse_button_callback(std::function<void(int button, bool pressed)> cb) {
        on_mouse_btn_ = std::move(cb);
    }

private:
    bool running_ = false;
    uint32_t width_ = 1920;
    uint32_t height_ = 1080;
    bool mouse_captured_ = false;

    std::function<void(int, bool)> on_key_;
    std::function<void(float, float)> on_mouse_move_;
    std::function<void(int, bool)> on_mouse_btn_;
};

} // namespace mc3::platform
