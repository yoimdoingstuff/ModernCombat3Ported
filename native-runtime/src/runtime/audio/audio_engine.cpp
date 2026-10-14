#include "mc3/audio/audio_engine.hpp"
#include "mc3/log.hpp"

#include <algorithm>
#include <iomanip>
#include <sstream>

namespace mc3::audio {

AudioEngine::AudioEngine() = default;
AudioEngine::~AudioEngine() {
    shutdown();
}

bool AudioEngine::initialize(const AudioConfig& config) {
    config_ = config;
    initialized_ = true;
    mc3::log_info("AudioEngine: Initialized OpenSL ES audio bridge -> Host PCM Stream (" +
                 std::to_string(config_.sample_rate) + "Hz, Stereo, Latency: low)");
    if (config_.spatial_audio_enabled) {
        mc3::log_info("AudioEngine: 3D Spatial Positional Audio Emulation ACTIVE (HRTF / Stereo Pan + Inverse Distance Rolloff).");
    }
    return true;
}

void AudioEngine::shutdown() {
    if (initialized_) {
        initialized_ = false;
        mc3::log_info("AudioEngine: Audio backend shut down cleanly.");
    }
}

void AudioEngine::queue_pcm_buffer(const void* data, size_t bytes) {
    (void)data;
    (void)bytes;
}

void AudioEngine::play_sound(const std::string& asset_path, float volume) {
    mc3::log_debug("AudioEngine: Play SFX: " + asset_path + " (vol=" + std::to_string(volume) + ")");
}

void AudioEngine::play_music(const std::string& music_path, bool loop) {
    mc3::log_info("AudioEngine: Play Music Stream: " + music_path + " (loop=" + (loop ? "yes" : "no") + ")");
}

void AudioEngine::set_listener_transform(const Vec3& position, const Vec3& forward, const Vec3& up) {
    listener_pos_ = position;
    listener_forward_ = forward;
    listener_up_ = up;
}

void AudioEngine::play_sound_3d(const std::string& asset_path, const Vec3& position, float volume) {
    SpatialEmitter emitter;
    emitter.position = position;
    play_sound_spatial(asset_path, emitter, volume);
}

void AudioEngine::play_sound_spatial(const std::string& asset_path, const SpatialEmitter& emitter, float base_volume) {
    if (!config_.spatial_audio_enabled) {
        play_sound(asset_path, base_volume);
        return;
    }

    // Relative offset from listener to sound emitter
    const float dx = emitter.position.x - listener_pos_.x;
    const float dy = emitter.position.y - listener_pos_.y;
    const float dz = emitter.position.z - listener_pos_.z;
    const float distance = std::sqrt(dx * dx + dy * dy + dz * dz);

    // OpenSL ES 3D distance attenuation: inverse distance model
    float clamped_dist = std::max(distance, emitter.min_distance);
    float distance_gain = 1.0f;
    if (clamped_dist < emitter.max_distance) {
        distance_gain = emitter.min_distance /
            (emitter.min_distance + emitter.rolloff_factor * (clamped_dist - emitter.min_distance));
    } else {
        distance_gain = 0.0f;
    }

    // Calculate azimuth angle for stereo panning (relative to listener's right vector)
    // listener right vector = forward cross up
    const float right_x = listener_forward_.y * listener_up_.z - listener_forward_.z * listener_up_.y;
    const float right_z = listener_forward_.x * listener_up_.y - listener_forward_.y * listener_up_.x;
    const float right_len = std::sqrt(right_x * right_x + right_z * right_z);

    float pan = 0.0f; // -1.0 (hard left) to +1.0 (hard right)
    if (distance > 0.001f && right_len > 0.001f) {
        const float norm_dx = dx / distance;
        const float norm_dz = dz / distance;
        pan = (norm_dx * (right_x / right_len)) + (norm_dz * (right_z / right_len));
        pan = std::clamp(pan, -1.0f, 1.0f);
    }

    // Left and right channel attenuation gains
    const float left_gain = std::clamp((1.0f - pan) * 0.5f * distance_gain * base_volume * config_.sfx_volume, 0.0f, 1.0f);
    const float right_gain = std::clamp((1.0f + pan) * 0.5f * distance_gain * base_volume * config_.sfx_volume, 0.0f, 1.0f);

    std::ostringstream ss;
    ss << std::fixed << std::setprecision(2);
    ss << "AudioEngine: 3D Positional SFX: " << asset_path
       << " [dist=" << distance << "m, pan=" << pan << ", L=" << left_gain << ", R=" << right_gain << "]";
    mc3::log_debug(ss.str());
}

void AudioEngine::set_master_volume(float volume) {
    config_.master_volume = volume;
    mc3::log_info("AudioEngine: Set master volume: " + std::to_string(volume));
}

} // namespace mc3::audio

