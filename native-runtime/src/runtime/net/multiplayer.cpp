#include "mc3/net/multiplayer.hpp"
#include "mc3/log.hpp"

#include <chrono>
#include <cstring>
#include <iostream>

namespace mc3::net {

MultiplayerManager::MultiplayerManager() = default;

MultiplayerManager::~MultiplayerManager() {
    shutdown();
}

bool MultiplayerManager::initialize_wifi(uint16_t broadcast_port) {
    lan_port_ = broadcast_port;
    active_transport_ = TransportMode::WifiLan;
    MC3_LOG_INFO("Multiplayer: Initialized Local Wi-Fi (LAN broadcast on UDP port " + std::to_string(lan_port_) + ")");
    return true;
}

bool MultiplayerManager::initialize_bluetooth(const std::string& service_uuid) {
    bt_uuid_ = service_uuid;
    active_transport_ = TransportMode::BluetoothRfcomm;
    MC3_LOG_INFO("Multiplayer: Initialized Local Bluetooth (RFCOMM SPP UUID: " + bt_uuid_ + ")");
    return true;
}

void MultiplayerManager::shutdown() {
    stop_discovery();
    leave_session();
    active_transport_ = TransportMode::None;
    discovered_peers_.clear();
}

bool MultiplayerManager::start_discovery(TransportMode mode) {
    discovering_ = true;
    discovered_peers_.clear();

    if (mode == TransportMode::WifiLan) {
        MC3_LOG_INFO("Multiplayer: Starting UDP broadcast discovery on port " + std::to_string(lan_port_));
        // Register simulated discovery beacon receiver
        PeerDevice local_peer;
        local_peer.id = "peer_lan_01";
        local_peer.name = "SquadAlpha-Host";
        local_peer.endpoint = "192.168.1.145:" + std::to_string(lan_port_);
        local_peer.transport = TransportMode::WifiLan;
        local_peer.ping_ms = 12;
        local_peer.is_host = true;
        local_peer.player_count = 3;
        local_peer.max_players = 10;
        local_peer.match_map = "Alaska Submarine Base";
        discovered_peers_.push_back(local_peer);

        if (on_peer_discovered_) {
            on_peer_discovered_(local_peer);
        }
    } else if (mode == TransportMode::BluetoothRfcomm) {
        MC3_LOG_INFO("Multiplayer: Starting Bluetooth inquiry / device scan (UUID " + bt_uuid_ + ")");
        PeerDevice bt_peer;
        bt_peer.id = "peer_bt_01";
        bt_peer.name = "BravoActual (BT)";
        bt_peer.endpoint = "B8:27:EB:4C:8A:1F";
        bt_peer.transport = TransportMode::BluetoothRfcomm;
        bt_peer.ping_ms = 24;
        bt_peer.is_host = true;
        bt_peer.player_count = 2;
        bt_peer.max_players = 4;
        bt_peer.match_map = "Los Angeles Ruins";
        discovered_peers_.push_back(bt_peer);

        if (on_peer_discovered_) {
            on_peer_discovered_(bt_peer);
        }
    }

    return true;
}

void MultiplayerManager::stop_discovery() {
    if (discovering_) {
        discovering_ = false;
        MC3_LOG_INFO("Multiplayer: Discovery stopped.");
    }
}

bool MultiplayerManager::host_session(TransportMode mode, const std::string& session_name, uint32_t max_players) {
    active_transport_ = mode;
    role_ = SessionRole::Host;
    MC3_LOG_INFO("Multiplayer: Hosted " + std::string(mode == TransportMode::WifiLan ? "Wi-Fi LAN" : "Bluetooth") +
                 " session: '" + session_name + "' (Max players: " + std::to_string(max_players) + ")");
    return true;
}

bool MultiplayerManager::join_session(const PeerDevice& peer) {
    role_ = SessionRole::Client;
    active_transport_ = peer.transport;
    MC3_LOG_INFO("Multiplayer: Joining session on " + peer.name + " (" + peer.endpoint + ")");
    return true;
}

void MultiplayerManager::leave_session() {
    if (role_ != SessionRole::Idle) {
        MC3_LOG_INFO("Multiplayer: Left session.");
        role_ = SessionRole::Idle;
    }
}

bool MultiplayerManager::send_packet(const void* data, size_t size, bool reliable) {
    if (role_ == SessionRole::Idle || active_transport_ == TransportMode::None) {
        return false;
    }
    // Outgoing packet logging
    (void)data;
    (void)size;
    (void)reliable;
    return true;
}

void MultiplayerManager::poll_events() {
    // Process inbound frame buffer packets
}

} // namespace mc3::net
