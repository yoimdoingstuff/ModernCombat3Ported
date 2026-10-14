#pragma once

#include <cstdint>
#include <string>
#include <vector>
#include <memory>
#include <functional>
#include <optional>

namespace mc3::net {

enum class TransportMode {
    None,
    WifiLan,
    BluetoothRfcomm
};

enum class SessionRole {
    Idle,
    Host,
    Client
};

struct PeerDevice {
    std::string id;
    std::string name;
    std::string endpoint; // IP:port or Bluetooth MAC
    TransportMode transport = TransportMode::None;
    uint32_t ping_ms = 0;
    bool is_host = false;
    uint32_t player_count = 1;
    uint32_t max_players = 10;
    std::string match_map = "Operation Fallen Nation";
};

struct PacketHeader {
    uint32_t magic = 0x4D43334E; // "MC3N"
    uint16_t version = 1;
    uint16_t type = 0;
    uint32_t sequence = 0;
    uint32_t payload_size = 0;
};

class MultiplayerManager {
public:
    static constexpr uint16_t DEFAULT_LAN_PORT = 2302;
    static constexpr const char* DEFAULT_BT_UUID = "00001101-0000-1000-8000-00805F9B34FB"; // Serial Port Profile (SPP)

    MultiplayerManager();
    ~MultiplayerManager();

    bool initialize_wifi(uint16_t broadcast_port = DEFAULT_LAN_PORT);
    bool initialize_bluetooth(const std::string& service_uuid = DEFAULT_BT_UUID);
    void shutdown();

    bool start_discovery(TransportMode mode);
    void stop_discovery();

    bool host_session(TransportMode mode, const std::string& session_name, uint32_t max_players = 10);
    bool join_session(const PeerDevice& peer);
    void leave_session();

    bool send_packet(const void* data, size_t size, bool reliable = false);
    void poll_events();

    TransportMode active_transport() const { return active_transport_; }
    SessionRole session_role() const { return role_; }
    bool is_discovering() const { return discovering_; }
    const std::vector<PeerDevice>& discovered_peers() const { return discovered_peers_; }

    void set_peer_discovered_callback(std::function<void(const PeerDevice&)> cb) {
        on_peer_discovered_ = std::move(cb);
    }
    void set_packet_received_callback(std::function<void(const uint8_t*, size_t)> cb) {
        on_packet_received_ = std::move(cb);
    }

private:
    TransportMode active_transport_ = TransportMode::None;
    SessionRole role_ = SessionRole::Idle;
    bool discovering_ = false;
    uint16_t lan_port_ = DEFAULT_LAN_PORT;
    std::string bt_uuid_ = DEFAULT_BT_UUID;
    std::vector<PeerDevice> discovered_peers_;

    std::function<void(const PeerDevice&)> on_peer_discovered_;
    std::function<void(const uint8_t*, size_t)> on_packet_received_;
};

} // namespace mc3::net
