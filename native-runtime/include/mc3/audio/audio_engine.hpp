#pragma once

#include <cstdint>
#include <string>
#include <vector>
#include <cmath>

namespace mc3::audio {

struct Vec3 {
    float x = 0.0f;
    float y = 0.0f;
    float z = 0.0f;

    float length_squared() const { return x * x + y * y + z * z; }
    float length() const { return std::sqrt(length_squared()); }
};

struct AudioConfig {
    uint32_t sample_rate = 44100;
    uint16_t channels = 2; // Stereo
    uint16_t buffer_frames = 512;
    float master_volume = 1.0f;
    float sfx_volume = 1.0f;
    float music_volume = 0.8f;
    bool spatial_audio_enabled = true;
};

struct SpatialEmitter {
    Vec3 position;
    Vec3 velocity;
    float min_distance = 1.0f;
    float max_distance = 60.0f;
    float rolloff_factor = 1.0f;
    float doppler_factor = 1.0f;
};

class AudioEngine {
public:
    AudioEngine();
    ~AudioEngine();

    bool initialize(const AudioConfig& config = AudioConfig{});
    void shutdown();

    void queue_pcm_buffer(const void* data, size_t bytes);
    void play_sound(const std::string& asset_path, float volume = 1.0f);
    void play_music(const std::string& music_path, bool loop = true);

    // 3D Spatial Positional Audio Emulation (OpenSL ES 3D location bridge)
    void set_listener_transform(const Vec3& position, const Vec3& forward, const Vec3& up);
    void play_sound_3d(const std::string& asset_path, const Vec3& position, float volume = 1.0f);
    void play_sound_spatial(const std::string& asset_path, const SpatialEmitter& emitter, float base_volume = 1.0f);

    void set_master_volume(float volume);
    float master_volume() const { return config_.master_volume; }

    bool is_initialized() const { return initialized_; }
    bool spatial_enabled() const { return config_.spatial_audio_enabled; }

private:
    bool initialized_ = false;
    AudioConfig config_;

    // Listener 3D State
    Vec3 listener_pos_{0.0f, 0.0f, 0.0f};
    Vec3 listener_forward_{0.0f, 0.0f, 1.0f};
    Vec3 listener_up_{0.0f, 1.0f, 0.0f};
};

} // namespace mc3::audio

