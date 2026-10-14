#include "mc3/input/input_manager.hpp"
#include "mc3/log.hpp"

namespace mc3::input {

InputManager::InputManager() = default;
InputManager::~InputManager() = default;

void InputManager::initialize(float mouse_sensitivity) {
    mouse_sensitivity_ = mouse_sensitivity;
    mc3::log_info("InputManager: Initialized PC input translation (Mouse Look sens=" +
                 std::to_string(mouse_sensitivity_) + ", Touchscreen HUD strictly SUPPRESSED)");
}

void InputManager::update() {
    // Process input buffer
}

void InputManager::on_key_event(int keycode, bool is_down) {
    // Standard WASD and tactical keys
    switch (keycode) {
        case 'W': case 'w': state_.move_y = is_down ? 1.0f : 0.0f; break;
        case 'S': case 's': state_.move_y = is_down ? -1.0f : 0.0f; break;
        case 'A': case 'a': state_.move_x = is_down ? -1.0f : 0.0f; break;
        case 'D': case 'd': state_.move_x = is_down ? 1.0f : 0.0f; break;
        case 'R': case 'r': state_.reload = is_down; break;
        case 'G': case 'g': state_.throw_grenade = is_down; break;
        case 'C': case 'c': state_.crouch = is_down; break;
        case ' ':           state_.jump_vault = is_down; break;
        case '1': if (is_down) state_.selected_weapon_slot = 1; break;
        case '2': if (is_down) state_.selected_weapon_slot = 2; break;
        case '3': if (is_down) state_.selected_weapon_slot = 3; break;
        case '4': if (is_down) state_.selected_weapon_slot = 4; break;
        default: break;
    }
}

void InputManager::on_mouse_motion(float delta_x, float delta_y) {
    state_.look_yaw += delta_x * mouse_sensitivity_ * 0.15f;
    state_.look_pitch += delta_y * mouse_sensitivity_ * 0.15f;
    
    // Clamp pitch between -89 and +89 degrees
    if (state_.look_pitch > 89.0f) state_.look_pitch = 89.0f;
    if (state_.look_pitch < -89.0f) state_.look_pitch = -89.0f;
}

void InputManager::on_mouse_button(int button_index, bool is_down) {
    if (button_index == 1) { // Left click
        state_.fire_primary = is_down;
    } else if (button_index == 3) { // Right click
        state_.aim_down_sights = is_down;
    }
}

void InputManager::reset_frame_deltas() {
    state_.reload = false;
    state_.throw_grenade = false;
}

} // namespace mc3::input
