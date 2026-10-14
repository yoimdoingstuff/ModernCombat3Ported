import React, { useState, useEffect } from 'react';
import { PeerDevice, NetworkPacket } from '../types/mc3';
import { 
  Wifi, 
  Bluetooth, 
  Radio, 
  Server, 
  Users, 
  Signal, 
  ShieldCheck, 
  Play, 
  Square, 
  RefreshCw, 
  CheckCircle,
  Network,
  Activity,
  Zap,
  Globe
} from 'lucide-react';

export const MultiplayerTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'wifi' | 'bluetooth'>('wifi');
  const [lanPort, setLanPort] = useState(2302);
  const [sessionName, setSessionName] = useState('Bravo-HQ-Deathmatch');
  const [selectedMap, setSelectedMap] = useState('Alaska Submarine Base');
  const [gameMode, setGameMode] = useState('Team Deathmatch (4v4)');
  const [maxPlayers, setMaxPlayers] = useState(8);

  // Wi-Fi State
  const [wifiState, setWifiState] = useState<'IDLE' | 'HOSTING' | 'SCANNING' | 'CONNECTED'>('IDLE');
  const [lanPeers, setLanPeers] = useState<PeerDevice[]>([
    {
      id: 'lan-1',
      name: 'AlphaSquad-Host',
      endpoint: '192.168.1.145:2302',
      transport: 'WIFI_LAN',
      pingMs: 14,
      isHost: true,
      playerCount: 4,
      maxPlayers: 8,
      mapName: 'Alaska Submarine Base',
      gameMode: 'Team Deathmatch',
      status: 'HOSTING',
    },
    {
      id: 'lan-2',
      name: 'DeltaTeam-FFA',
      endpoint: '192.168.1.202:2302',
      transport: 'WIFI_LAN',
      pingMs: 28,
      isHost: true,
      playerCount: 6,
      maxPlayers: 12,
      mapName: 'Los Angeles Ruins',
      gameMode: 'Free For All',
      status: 'HOSTING',
    },
  ]);

  // Bluetooth State
  const [btState, setBtState] = useState<'IDLE' | 'SCANNING' | 'HOSTING' | 'CONNECTED'>('IDLE');
  const [btPairingPin, setBtPairingPin] = useState('0000');
  const [btPeers, setBtPeers] = useState<PeerDevice[]>([
    {
      id: 'bt-1',
      name: 'MC3-Android-Peer (Galaxy SII)',
      endpoint: 'B8:27:EB:4C:8A:1F',
      transport: 'BLUETOOTH_RFCOMM',
      pingMs: 32,
      isHost: true,
      playerCount: 2,
      maxPlayers: 4,
      mapName: 'North Korea Outpost',
      gameMode: '1v1 Duel',
      status: 'HOSTING',
    },
    {
      id: 'bt-2',
      name: 'Deck-Linux-Client',
      endpoint: '44:65:0D:98:21:7E',
      transport: 'BLUETOOTH_RFCOMM',
      pingMs: 19,
      isHost: false,
      playerCount: 1,
      maxPlayers: 4,
      mapName: 'Lobby',
      gameMode: 'Ready',
      status: 'DISCOVERED',
    },
  ]);

  // Packet Stream
  const [packets, setPackets] = useState<NetworkPacket[]>([
    {
      id: 'pkt-1',
      timestamp: '16:40:02.104',
      direction: 'OUT',
      transport: 'WIFI_LAN',
      magic: 'MC3N',
      type: 'DISCOVERY_BEACON',
      seq: 104,
      sizeBytes: 64,
      summary: 'LAN Broadcast UDP 255.255.255.255:2302',
    },
    {
      id: 'pkt-2',
      timestamp: '16:40:02.122',
      direction: 'IN',
      transport: 'WIFI_LAN',
      magic: 'MC3N',
      type: 'DISCOVERY_RESPONSE',
      seq: 88,
      sizeBytes: 128,
      summary: 'Host response from 192.168.1.145 (AlphaSquad-Host)',
    },
    {
      id: 'pkt-3',
      timestamp: '16:40:03.001',
      direction: 'IN',
      transport: 'BLUETOOTH_RFCOMM',
      magic: 'MC3B',
      type: 'RFCOMM_HANDSHAKE',
      seq: 1,
      sizeBytes: 32,
      summary: 'SPP Channel 1 negotiation with B8:27:EB:4C:8A:1F',
    },
  ]);

  // Periodic simulated packet ping
  useEffect(() => {
    const interval = setInterval(() => {
      if (wifiState === 'HOSTING' || wifiState === 'CONNECTED' || btState === 'HOSTING' || btState === 'CONNECTED') {
        const isWifi = activeSubTab === 'wifi';
        const newPkt: NetworkPacket = {
          id: `pkt-${Date.now()}`,
          timestamp: new Date().toTimeString().split(' ')[0] + '.' + Math.floor(Math.random() * 900 + 100),
          direction: Math.random() > 0.5 ? 'IN' : 'OUT',
          transport: isWifi ? 'WIFI_LAN' : 'BLUETOOTH_RFCOMM',
          magic: isWifi ? 'MC3N' : 'MC3B',
          type: isWifi ? 'SYNC_TICK_60HZ' : 'RFCOMM_DATA',
          seq: Math.floor(Math.random() * 5000),
          sizeBytes: Math.floor(Math.random() * 256 + 64),
          summary: isWifi ? 'Entity delta sync (Player pos/rot/health)' : 'Framed byte stream packet ch=1',
        };
        setPackets((prev) => [newPkt, ...prev.slice(0, 15)]);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [wifiState, btState, activeSubTab]);

  const handleStartHosting = () => {
    if (activeSubTab === 'wifi') {
      setWifiState('HOSTING');
      const myHost: PeerDevice = {
        id: 'me-host',
        name: sessionName + ' (You)',
        endpoint: `192.168.1.100:${lanPort}`,
        transport: 'WIFI_LAN',
        pingMs: 0,
        isHost: true,
        playerCount: 1,
        maxPlayers,
        mapName: selectedMap,
        gameMode,
        status: 'HOSTING',
      };
      setLanPeers((prev) => [myHost, ...prev.filter((p) => p.id !== 'me-host')]);
    } else {
      setBtState('HOSTING');
      const myBtHost: PeerDevice = {
        id: 'me-bt-host',
        name: sessionName + ' (Host-BT)',
        endpoint: '00:1A:7D:DA:71:13',
        transport: 'BLUETOOTH_RFCOMM',
        pingMs: 0,
        isHost: true,
        playerCount: 1,
        maxPlayers: 4,
        mapName: selectedMap,
        gameMode,
        status: 'HOSTING',
      };
      setBtPeers((prev) => [myBtHost, ...prev.filter((p) => p.id !== 'me-bt-host')]);
    }
  };

  const handleStopHosting = () => {
    if (activeSubTab === 'wifi') {
      setWifiState('IDLE');
      setLanPeers((prev) => prev.filter((p) => p.id !== 'me-host'));
    } else {
      setBtState('IDLE');
      setBtPeers((prev) => prev.filter((p) => p.id !== 'me-bt-host'));
    }
  };

  const handleJoinPeer = (peer: PeerDevice) => {
    if (peer.transport === 'WIFI_LAN') {
      setWifiState('CONNECTED');
    } else {
      setBtState('CONNECTED');
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 mt-1">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-sans">
                Native Local Multiplayer: LAN Play, Wi-Fi &amp; Bluetooth RFCOMM
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                Modern Combat 3's multiplayer features <span className="text-emerald-400 font-mono">zero-lag LAN play</span>, direct IP joins, UDP subnet discovery on port 2302, and native desktop Bluetooth bridges (Windows Winsock AF_BTH, Linux BlueZ, macOS IOBluetooth). Supports 100% peer cross-play with original Android/iOS mobile devices and the <span className="text-emerald-400 font-mono">Xbox 360 System Link</span> roadmap target.
              </p>
            </div>
          </div>

          {/* Sub-tab selection buttons */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveSubTab('wifi')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeSubTab === 'wifi'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wifi className="w-3.5 h-3.5" />
              <span>Local Wi-Fi (LAN)</span>
            </button>

            <button
              onClick={() => setActiveSubTab('bluetooth')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeSubTab === 'bluetooth'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bluetooth className="w-3.5 h-3.5" />
              <span>Local Bluetooth</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Match Hosting & Discovered Peer Lobbies */}
        <div className="lg:col-span-7 space-y-6">
          {/* Host Match Configuration Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                  {activeSubTab === 'wifi' ? 'Host Local Wi-Fi (LAN) Match' : 'Host Local Bluetooth RFCOMM Match'}
                </h3>
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                Status:{' '}
                <span className={
                  (activeSubTab === 'wifi' ? wifiState : btState) === 'HOSTING'
                    ? 'text-emerald-400 font-semibold'
                    : (activeSubTab === 'wifi' ? wifiState : btState) === 'CONNECTED'
                    ? 'text-blue-400 font-semibold'
                    : 'text-slate-500'
                }>
                  {activeSubTab === 'wifi' ? wifiState : btState}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Session Lobby Name:</label>
                <input
                  type="text"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-xs text-slate-200 focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Map Selection:</label>
                <select
                  value={selectedMap}
                  onChange={(e) => setSelectedMap(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-xs text-slate-200 focus:outline-none focus:border-amber-500/60"
                >
                  <option value="Alaska Submarine Base">Alaska Submarine Base</option>
                  <option value="Los Angeles Ruins">Los Angeles Ruins</option>
                  <option value="North Korea Outpost">North Korea Outpost</option>
                  <option value="Siberia Train Depot">Siberia Train Depot</option>
                  <option value="Washington Aircraft Carrier">Washington Aircraft Carrier</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Game Mode:</label>
                <select
                  value={gameMode}
                  onChange={(e) => setGameMode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-xs text-slate-200 focus:outline-none focus:border-amber-500/60"
                >
                  <option value="Team Deathmatch (4v4)">Team Deathmatch (4v4)</option>
                  <option value="Free For All (12p)">Free For All (12 Players)</option>
                  <option value="Capture The Flag">Capture The Flag</option>
                  <option value="Zone Control">Zone Control</option>
                  <option value="Bomb Defusal">Bomb Defusal</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">
                  {activeSubTab === 'wifi' ? 'UDP Broadcast Port:' : 'RFCOMM Pairing PIN:'}
                </label>
                {activeSubTab === 'wifi' ? (
                  <input
                    type="number"
                    value={lanPort}
                    onChange={(e) => setLanPort(+e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-xs text-slate-200 focus:outline-none focus:border-amber-500/60"
                  />
                ) : (
                  <input
                    type="text"
                    value={btPairingPin}
                    onChange={(e) => setBtPairingPin(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-xs text-slate-200 focus:outline-none focus:border-amber-500/60"
                  />
                )}
              </div>
            </div>

            {/* Host / Stop Actions */}
            <div className="flex items-center gap-3 pt-2">
              {(activeSubTab === 'wifi' ? wifiState : btState) === 'HOSTING' ? (
                <button
                  onClick={handleStopHosting}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-colors"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>Stop Hosting Match</span>
                </button>
              ) : (
                <button
                  onClick={handleStartHosting}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Broadcast &amp; Host Session</span>
                </button>
              )}

              <span className="text-[11px] font-mono text-slate-400">
                {activeSubTab === 'wifi'
                  ? 'UDP beacon broadcast: 255.255.255.255:2302'
                  : 'RFCOMM SPP UUID: 00001101-0000-1000-8000-00805F9B34FB'}
              </span>
            </div>
          </div>

          {/* Discovered Lobbies / Nearby Peers List */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                  {activeSubTab === 'wifi' ? 'Discovered LAN Hosts (Subnet Scan)' : 'Discovered Bluetooth Devices'}
                </h3>
              </div>
              <button
                onClick={() => {
                  if (activeSubTab === 'wifi') setWifiState('SCANNING');
                  else setBtState('SCANNING');
                  setTimeout(() => {
                    if (activeSubTab === 'wifi') setWifiState('IDLE');
                    else setBtState('IDLE');
                  }, 1200);
                }}
                className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-mono"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Rescan</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {(activeSubTab === 'wifi' ? lanPeers : btPeers).map((peer) => (
                <div
                  key={peer.id}
                  className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-200">{peer.name}</span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded">
                        {peer.gameMode}
                      </span>
                      {peer.isHost && (
                        <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded">
                          HOST
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                      <span>Map: {peer.mapName}</span>
                      <span>·</span>
                      <span>Players: {peer.playerCount}/{peer.maxPlayers}</span>
                      <span>·</span>
                      <span className="text-amber-300/90">{peer.endpoint}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                      <Signal className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{peer.pingMs} ms</span>
                    </div>

                    <button
                      onClick={() => handleJoinPeer(peer)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 text-white transition-colors"
                    >
                      Join Match
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Protocol Architecture & Live Packet Stream */}
        <div className="lg:col-span-5 space-y-6">
          {/* Architecture Mapping Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                  {activeSubTab === 'wifi' ? 'Wi-Fi Socket Protocol Bridge' : 'Bluetooth RFCOMM Driver Bridge'}
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">HAL SHIM</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-950/70 border border-slate-800/80 rounded p-2.5 font-mono text-[11px] space-y-1">
                <div className="text-slate-500 font-bold">ANDROID GUEST API:</div>
                <div className="text-amber-300">
                  {activeSubTab === 'wifi'
                    ? 'android.net.wifi.WifiManager / BSD Sockets'
                    : 'android.bluetooth.BluetoothAdapter / BluetoothSocket'}
                </div>
                <div className="text-slate-500 font-bold mt-2">NATIVE PC MAPPING:</div>
                <div className="text-emerald-400">
                  {activeSubTab === 'wifi'
                    ? 'POSIX/WinSock UDP broadcast socket (SO_BROADCAST)'
                    : 'Win32 Winsock AF_BTH / Linux BlueZ / macOS IOBluetooth'}
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                {activeSubTab === 'wifi'
                  ? 'The local Wi-Fi layer allows cross-play with unmodified Android devices on the same wireless router or ad-hoc hotspot, sharing the identical binary payload structure.'
                  : 'The Bluetooth layer translates RFCOMM SPP stream frames directly to host OS Bluetooth transceivers, enabling 2-4 player direct device-to-device wireless sessions.'}
              </p>
            </div>
          </div>

          {/* Live Packet Telemetry Stream */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                  Multiplayer Packet Stream (Live Telemetry)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500">60 Hz Tick</span>
            </div>

            <div className="space-y-2 text-xs font-mono max-h-[300px] overflow-y-auto">
              {packets.map((pkt) => (
                <div
                  key={pkt.id}
                  className="bg-slate-950/70 border border-slate-800/80 rounded p-2 text-[11px] space-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-bold ${pkt.direction === 'OUT' ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {pkt.direction === 'OUT' ? '▲ OUT' : '▼ IN'} · {pkt.type}
                    </span>
                    <span className="text-slate-500">{pkt.timestamp}</span>
                  </div>
                  <div className="text-slate-400 flex items-center justify-between">
                    <span>Seq: #{pkt.seq} · {pkt.sizeBytes} B</span>
                    <span className="text-slate-600">{pkt.magic}</span>
                  </div>
                  <div className="text-slate-500 truncate">{pkt.summary}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
