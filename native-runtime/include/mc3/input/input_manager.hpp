#pragma once

#include <cstdint>
#include <string>

namespace mc3::input {

struct InputState {
    float move_x = 0.0f;     // -1.0 (A) to +1.0 (D)
    float move_y = 0.0f;     // -1.0 (S) to +1.0 (W)
    float look_yaw = 0.0f;   // Horizontal camera delta
    float look_pitch = 0.0f; // Vertical camera delta
    bool fire_primary = false;
    bool aim_down_sights = false;
    bool sprint = false;
    bool crouch = false;
    bool jump_vault = false;
    bool reload = false;
    bool throw_grenade = false;
    int selected_weapon_slot = 1;
};

class InputManager {
public:
    InputManager();
    ~InputManager();

    void initialize(float mouse_sensitivity = 1.0f);
    void update();

    void on_key_event(int keycode, bool is_down);
    void on_mouse_motion(float delta_x, float delta_y);
    void on_mouse_button(int button_index, bool is_down);

    const InputState& current_state() const { return state_; }
    void reset_frame_deltas();

    bool is_touch_hud_suppressed() const { return true; } // Strict agents.md requirement

    void set_sensitivity(float sens) { mouse_sensitivity_ = sens; }
    float sensitivity() const { return mouse_sensitivity_; }

private:
    float mouse_sensitivity_ = 1.0f;
    InputState state_;
};

} // namespace mc3::input
