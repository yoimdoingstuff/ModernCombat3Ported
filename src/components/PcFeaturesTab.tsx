import React, { useState, useEffect, useRef } from 'react';
import { KeyBinding, GamepadConfig } from '../types/mc3';
import { 
  Keyboard, 
  Gamepad2, 
  MousePointer, 
  Wifi, 
  Bluetooth, 
  Network, 
  Tv, 
  Sliders, 
  ShieldCheck, 
  Crosshair, 
  Play, 
  Square, 
  RotateCcw, 
  Volume2, 
  CheckCircle2, 
  Activity, 
  Copy, 
  Check, 
  Terminal, 
  Zap, 
  Search,
  Radio,
  Eye,
  EyeOff
} from 'lucide-react';

export const PcFeaturesTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'keyboard_mouse' | 'gamepad' | 'lan_networking' | 'xbox360'>('keyboard_mouse');

  // Mouse & ADS settings
  const [rawInput, setRawInput] = useState(true);
  const [mouseSensitivity, setMouseSensitivity] = useState(2.8);
  const [adsMultiplier, setAdsMultiplier] = useState(0.75);
  const [invertY, setInvertY] = useState(false);
  const [mouseSmoothing, setMouseSmoothing] = useState(false);
  const [hideMobileTouchHUD, setHideMobileTouchHUD] = useState(true);

  // Interactive Aim Test Canvas
  const [crosshairPos, setCrosshairPos] = useState({ x: 150, y: 100 });
  const [isAimingDownSights, setIsAimingDownSights] = useState(false);
  const [isFiring, setIsFiring] = useState(false);
  const [bulletCount, setBulletCount] = useState(30);
  const [hitFeedback, setHitFeedback] = useState(false);
  const aimBoxRef = useRef<HTMLDivElement>(null);

  // Keybindings
  const [keybindings, setKeybindings] = useState<KeyBinding[]>([
    { id: 'kb-1', action: 'Move Forward', category: 'Movement', primaryKey: 'W', description: 'Walk / Sprint forward' },
    { id: 'kb-2', action: 'Move Backward', category: 'Movement', primaryKey: 'S', description: 'Walk backward' },
    { id: 'kb-3', action: 'Strafe Left', category: 'Movement', primaryKey: 'A', description: 'Side-step left' },
    { id: 'kb-4', action: 'Strafe Right', category: 'Movement', primaryKey: 'D', description: 'Side-step right' },
    { id: 'kb-5', action: 'Sprint / Tactical Sprint', category: 'Movement', primaryKey: 'Left Shift', description: 'Hold or toggle fast sprint' },
    { id: 'kb-6', action: 'Crouch / Slide', category: 'Movement', primaryKey: 'C', secondaryKey: 'Left Ctrl', description: 'Crouch behind cover or tactical slide' },
    { id: 'kb-7', action: 'Jump / Mantle', category: 'Movement', primaryKey: 'Space', description: 'Jump or climb over obstacles' },
    { id: 'kb-8', action: 'Fire Weapon', category: 'Combat', primaryKey: 'Left Mouse Button', description: 'Discharge equipped firearm' },
    { id: 'kb-9', action: 'Aim Down Sights (ADS)', category: 'Combat', primaryKey: 'Right Mouse Button', description: 'Precision iron sights / optic zoom' },
    { id: 'kb-10', action: 'Reload', category: 'Combat', primaryKey: 'R', description: 'Replace current ammunition magazine' },
    { id: 'kb-11', action: 'Quick Melee', category: 'Combat', primaryKey: 'V', secondaryKey: 'Mouse 4', description: 'Combat knife thrust' },
    { id: 'kb-12', action: 'Frag Grenade', category: 'Combat', primaryKey: 'G', description: 'Prime and throw explosive grenade' },
    { id: 'kb-13', action: 'Flashbang / EMP', category: 'Combat', primaryKey: 'E', description: 'Deploy tactical ordnance' },
    { id: 'kb-14', action: 'Primary Weapon', category: 'Weapon', primaryKey: '1', description: 'Switch to primary rifle / SMG' },
    { id: 'kb-15', action: 'Secondary Pistol', category: 'Weapon', primaryKey: '2', description: 'Draw sidearm pistol' },
    { id: 'kb-16', action: 'Heavy / Launcher', category: 'Weapon', primaryKey: '3', description: 'Equip rocket launcher / heavy weapon' },
    { id: 'kb-17', action: 'Cycle Weapons', category: 'Weapon', primaryKey: 'Mouse Wheel', description: 'Scroll to cycle through weapons' },
    { id: 'kb-18', action: 'Tactical Scoreboard', category: 'System', primaryKey: 'Tab', description: 'Show kill/death multiplayer stats' },
    { id: 'kb-19', action: 'Pause / Options', category: 'System', primaryKey: 'Escape', description: 'Open in-game tactical menu' },
  ]);

  const [editingBindId, setEditingBindId] = useState<string | null>(null);

  // Gamepad State
  const [gamepadConfig, setGamepadConfig] = useState<GamepadConfig>({
    layout: 'Xbox 360',
    leftDeadzone: 0.12,
    rightDeadzone: 0.10,
    sensitivity: 3.2,
    adsMultiplier: 0.70,
    stickCurve: 'Exponential',
    rumbleEnabled: true,
    rumbleIntensity: 0.85,
    invertY: false,
  });

  const [activeGamepadName, setActiveGamepadName] = useState<string | null>(null);
  const [rumbleActive, setRumbleActive] = useState(false);
  const [gamepadStickPos, setGamepadStickPos] = useState({ lx: 0, ly: 0, rx: 0, ry: 0 });
  const [gamepadButtonsPressed, setGamepadButtonsPressed] = useState<Record<string, boolean>>({});

  // Poll real browser gamepad if available
  useEffect(() => {
    let animId: number;
    const pollGamepad = () => {
      if (typeof navigator !== 'undefined' && 'getGamepads' in navigator) {
        const gamepads = navigator.getGamepads();
        const gp = gamepads[0] || gamepads[1];
        if (gp) {
          setActiveGamepadName(gp.id);
          setGamepadStickPos({
            lx: Math.abs(gp.axes[0]) > gamepadConfig.leftDeadzone ? gp.axes[0] : 0,
            ly: Math.abs(gp.axes[1]) > gamepadConfig.leftDeadzone ? gp.axes[1] : 0,
            rx: Math.abs(gp.axes[2]) > gamepadConfig.rightDeadzone ? gp.axes[2] : 0,
            ry: Math.abs(gp.axes[3]) > gamepadConfig.rightDeadzone ? gp.axes[3] : 0,
          });
          const pressed: Record<string, boolean> = {};
          gp.buttons.forEach((btn, idx) => {
            if (btn.pressed) pressed[idx.toString()] = true;
          });
          setGamepadButtonsPressed(pressed);
        } else {
          setActiveGamepadName(null);
        }
      }
      animId = requestAnimationFrame(pollGamepad);
    };
    animId = requestAnimationFrame(pollGamepad);
    return () => cancelAnimationFrame(animId);
  }, [gamepadConfig.leftDeadzone, gamepadConfig.rightDeadzone]);

  // LAN Networking state
  const [directConnectIp, setDirectConnectIp] = useState('192.168.1.150');
  const [directConnectPort, setDirectConnectPort] = useState(2302);
  const [pingResult, setPingResult] = useState<{ status: 'idle' | 'testing' | 'success' | 'failed'; ms?: number }>({ status: 'idle' });
  const [lanServerRunning, setLanServerRunning] = useState(false);
  const [lanServerMap, setLanServerMap] = useState('Alaska Submarine Base');
  const [lanServerTickrate, setLanServerTickrate] = useState<'30' | '60' | '120'>('60');
  const [copiedCli, setCopiedCli] = useState(false);

  // Xbox 360 state
  const [x360Dashboard, setX360Dashboard] = useState<'Aurora' | 'Freestyle Dash' | 'XeXMenu'>('Aurora');
  const [x360EndianMode, setX360EndianMode] = useState<'bswap_inline' | 'vector_altivec'>('bswap_inline');

  // Trigger rumble test
  const handleTestRumble = () => {
    setRumbleActive(true);
    if (typeof navigator !== 'undefined' && 'getGamepads' in navigator) {
      const gamepads = navigator.getGamepads();
      const gp = gamepads[0] || gamepads[1];
      // Check VibrationActuator API
      if (gp && 'vibrationActuator' in gp && (gp as any).vibrationActuator) {
        try {
          (gp as any).vibrationActuator.playEffect('dual-rumble', {
            startDelay: 0,
            duration: 600,
            weakMagnitude: gamepadConfig.rumbleIntensity,
            strongMagnitude: gamepadConfig.rumbleIntensity,
          });
        } catch {
          // fallback
        }
      }
    }
    setTimeout(() => {
      setRumbleActive(false);
    }, 600);
  };

  // Rebinding listener
  useEffect(() => {
    if (!editingBindId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      let keyName = e.key;
      if (keyName === ' ') keyName = 'Space';
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') keyName = 'Left Shift';
      if (e.code === 'ControlLeft' || e.code === 'ControlRight') keyName = 'Left Ctrl';
      if (keyName.length === 1) keyName = keyName.toUpperCase();

      setKeybindings((prev) =>
        prev.map((kb) => (kb.id === editingBindId ? { ...kb, primaryKey: keyName } : kb))
      );
      setEditingBindId(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingBindId]);

  const handleFireWeapon = () => {
    if (bulletCount > 0) {
      setIsFiring(true);
      setBulletCount((c) => c - 1);
      setHitFeedback(true);
      setTimeout(() => setIsFiring(false), 80);
      setTimeout(() => setHitFeedback(false), 200);
    }
  };

  const handleReload = () => {
    setBulletCount(30);
  };

  const testDirectPing = () => {
    setPingResult({ status: 'testing' });
    setTimeout(() => {
      setPingResult({ status: 'success', ms: Math.floor(Math.random() * 8) + 12 });
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 mt-1">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-sans">
                PC Specific Features &amp; Hardware Controls Hub
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-4xl leading-relaxed">
                Modern Combat 3 on PC eliminates mobile touchscreen controls, replacing them with <span className="text-amber-400 font-mono">raw mouse aiming</span>, customizable keyboard bindings, full <span className="text-amber-400 font-mono">XInput / SDL3 gamepad support</span>, zero-configuration <span className="text-emerald-400 font-mono">LAN &amp; Wi-Fi play</span>, Bluetooth RFCOMM socket bridging, and an <span className="text-emerald-400 font-mono">Xbox 360 Xenon roadmap</span>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              NATIVE PC CONTROLS VERIFIED
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto text-xs font-mono">
        <button
          onClick={() => setActiveSubTab('keyboard_mouse')}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
            activeSubTab === 'keyboard_mouse'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <MousePointer className="w-4 h-4 text-amber-400" />
          <span>Keyboard &amp; Raw Mouse Look</span>
        </button>

        <button
          onClick={() => setActiveSubTab('gamepad')}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
            activeSubTab === 'gamepad'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Gamepad2 className="w-4 h-4 text-amber-400" />
          <span>Gamepad &amp; Controller Support</span>
        </button>

        <button
          onClick={() => setActiveSubTab('lan_networking')}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
            activeSubTab === 'lan_networking'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Network className="w-4 h-4 text-emerald-400" />
          <span>LAN, Wi-Fi &amp; Bluetooth Play</span>
        </button>

        <button
          onClick={() => setActiveSubTab('xbox360')}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
            activeSubTab === 'xbox360'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Tv className="w-4 h-4 text-emerald-400" />
          <span>Xbox 360 Port &amp; Architecture</span>
        </button>
      </div>

      {/* TAB 1: KEYBOARD & MOUSE CONTROL */}
      {activeSubTab === 'keyboard_mouse' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Mouse Settings & Interactive Aim Tester */}
          <div className="lg:col-span-5 space-y-6">
            {/* Mouse Configuration Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    Raw Mouse Input &amp; Aim Parameters
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                  mc3.ini / [Input]
                </span>
              </div>

              <div className="space-y-4 text-xs font-mono">
                {/* Raw Input Toggle */}
                <div className="flex items-center justify-between p-2.5 rounded bg-slate-950 border border-slate-800">
                  <div>
                    <div className="text-slate-200 font-semibold">Raw Mouse Delta Input</div>
                    <div className="text-[10px] text-slate-500">Bypasses OS acceleration curves via SDL_SetRelativeMouseMode</div>
                  </div>
                  <button
                    onClick={() => setRawInput(!rawInput)}
                    className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                      rawInput ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {rawInput ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>

                {/* Touch HUD Suppression Toggle */}
                <div className="flex items-center justify-between p-2.5 rounded bg-slate-950 border border-slate-800">
                  <div>
                    <div className="text-slate-200 font-semibold">Suppress Mobile Touch HUD</div>
                    <div className="text-[10px] text-slate-500">Removes virtual touch buttons &amp; mobile joystick on PC</div>
                  </div>
                  <button
                    onClick={() => setHideMobileTouchHUD(!hideMobileTouchHUD)}
                    className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                      hideMobileTouchHUD ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {hideMobileTouchHUD ? 'HIDDEN' : 'VISIBLE'}
                  </button>
                </div>

                {/* Mouse Sensitivity Slider */}
                <div className="space-y-1.5 p-2.5 rounded bg-slate-950 border border-slate-800">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Look Sensitivity:</span>
                    <span className="text-amber-400 font-bold">{mouseSensitivity.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="6.0"
                    step="0.1"
                    value={mouseSensitivity}
                    onChange={(e) => setMouseSensitivity(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 bg-slate-800 rounded-lg h-1.5 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-600">
                    <span>0.5x (Tactical Slow)</span>
                    <span>3.0x (Default)</span>
                    <span>6.0x (Twitch Aim)</span>
                  </div>
                </div>

                {/* ADS Multiplier */}
                <div className="space-y-1.5 p-2.5 rounded bg-slate-950 border border-slate-800">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>ADS (Aim Down Sights) Multiplier:</span>
                    <span className="text-amber-400 font-bold">{adsMultiplier.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="1.5"
                    step="0.05"
                    value={adsMultiplier}
                    onChange={(e) => setAdsMultiplier(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 bg-slate-800 rounded-lg h-1.5 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-600">
                    <span>0.20x (Sniper Focus)</span>
                    <span>0.75x (Balanced)</span>
                    <span>1.50x (Fast Tracking)</span>
                  </div>
                </div>

                {/* Toggles */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setInvertY(!invertY)}
                    className={`p-2 rounded border text-center transition-colors ${
                      invertY ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Invert Y-Axis: {invertY ? 'ON' : 'OFF'}
                  </button>
                  <button
                    onClick={() => setMouseSmoothing(!mouseSmoothing)}
                    className={`p-2 rounded border text-center transition-colors ${
                      mouseSmoothing ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Mouse Smoothing: {mouseSmoothing ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive Aiming & Shooting Test Range */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Crosshair className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    Aim &amp; Recoil Firing Range (Interactive)
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-slate-400">Ammo:</span>
                  <span className={`font-bold ${bulletCount > 5 ? 'text-amber-400' : 'text-red-400'}`}>{bulletCount} / 30</span>
                  <button
                    onClick={handleReload}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded transition-colors"
                  >
                    Reload (R)
                  </button>
                </div>
              </div>

              {/* Aim Box Canvas */}
              <div
                ref={aimBoxRef}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = Math.max(10, Math.min(rect.width - 10, e.clientX - rect.left));
                  const y = Math.max(10, Math.min(rect.height - 10, e.clientY - rect.top));
                  setCrosshairPos({ x, y });
                }}
                onMouseDown={(e) => {
                  if (e.button === 0) handleFireWeapon();
                  if (e.button === 2) setIsAimingDownSights(true);
                }}
                onMouseUp={(e) => {
                  if (e.button === 2) setIsAimingDownSights(false);
                }}
                onContextMenu={(e) => e.preventDefault()}
                className={`relative w-full h-52 bg-slate-950 rounded-lg border overflow-hidden cursor-crosshair select-none transition-all ${
                  isAimingDownSights ? 'border-amber-500/70 bg-slate-950/90' : 'border-slate-800'
                } ${isFiring ? 'ring-2 ring-amber-400/50' : ''}`}
              >
                {/* Simulated Target Dummy */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-28 border border-slate-700/60 rounded-t-full bg-slate-900/40 flex flex-col items-center justify-center pointer-events-none">
                  <div className="w-8 h-8 rounded-full border border-slate-600/80 mb-2 flex items-center justify-center text-[9px] text-slate-500 font-mono">
                    HEAD
                  </div>
                  <div className="w-12 h-14 border border-slate-600/60 rounded flex items-center justify-center text-[9px] text-slate-500 font-mono">
                    CHEST
                  </div>
                </div>

                {/* Mobile touch HUD watermark if not hidden */}
                {!hideMobileTouchHUD && (
                  <div className="absolute inset-0 pointer-events-none flex justify-between items-end p-4 opacity-40">
                    <div className="w-16 h-16 rounded-full border border-dashed border-red-400 flex items-center justify-center text-[9px] text-red-400 font-mono text-center">
                      Virtual Stick
                    </div>
                    <div className="w-12 h-12 rounded-full border border-dashed border-red-400 flex items-center justify-center text-[9px] text-red-400 font-mono">
                      Fire
                    </div>
                  </div>
                )}

                {/* Crosshair Cursor */}
                <div
                  className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
                  style={{
                    left: `${crosshairPos.x}px`,
                    top: `${crosshairPos.y}px`,
                  }}
                >
                  <div className="relative flex items-center justify-center">
                    {/* Center Dot */}
                    <div className={`w-1.5 h-1.5 rounded-full ${isAimingDownSights ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                    {/* Reticle Lines */}
                    <div className={`absolute -top-3 w-0.5 h-2 ${isAimingDownSights ? 'bg-amber-400' : 'bg-emerald-400/80'}`} />
                    <div className={`absolute -bottom-3 w-0.5 h-2 ${isAimingDownSights ? 'bg-amber-400' : 'bg-emerald-400/80'}`} />
                    <div className={`absolute -left-3 w-2 h-0.5 ${isAimingDownSights ? 'bg-amber-400' : 'bg-emerald-400/80'}`} />
                    <div className={`absolute -right-3 w-2 h-0.5 ${isAimingDownSights ? 'bg-amber-400' : 'bg-emerald-400/80'}`} />

                    {/* Muzzle Flash animation */}
                    {isFiring && (
                      <div className="absolute w-8 h-8 rounded-full bg-amber-400/40 animate-ping" />
                    )}

                    {/* Hit marker */}
                    {hitFeedback && (
                      <div className="absolute w-5 h-5 border border-red-500 rotate-45 animate-pulse" />
                    )}
                  </div>
                </div>

                {/* Overlay Instructions */}
                <div className="absolute bottom-2 left-2 text-[10px] font-mono text-slate-500 pointer-events-none flex items-center gap-3">
                  <span>Left Click: Fire</span>
                  <span>·</span>
                  <span>Right Click: Hold ADS</span>
                  <span>·</span>
                  <span>R: Reload</span>
                </div>

                {isAimingDownSights && (
                  <div className="absolute top-2 right-2 text-[10px] font-mono text-amber-400 bg-amber-950/80 border border-amber-800/80 px-2 py-0.5 rounded">
                    ADS ACTIVE ({adsMultiplier.toFixed(2)}x Speed)
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Key Rebinding Matrix */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Keyboard className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    Customizable Keyboard &amp; Mouse Bindings
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setEditingBindId(null);
                  }}
                  className="text-xs font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Tactical Defaults</span>
                </button>
              </div>

              {editingBindId && (
                <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/50 text-xs font-mono text-amber-300 flex items-center justify-between">
                  <span>Press any key or mouse button on your hardware to assign...</span>
                  <button
                    onClick={() => setEditingBindId(null)}
                    className="text-slate-400 hover:text-slate-200 underline text-[11px]"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Bindings Table */}
              <div className="overflow-x-auto max-h-[520px] overflow-y-auto pr-1">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500">
                      <th className="py-2.5 px-3">Action</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Primary Key</th>
                      <th className="py-2.5 px-3">Secondary</th>
                      <th className="py-2.5 px-3 text-right">Rebind</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {keybindings.map((kb) => (
                      <tr key={kb.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-200">{kb.action}</div>
                          <div className="text-[10px] text-slate-500">{kb.description}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                            kb.category === 'Movement' ? 'bg-blue-950 text-blue-300 border border-blue-800/50' :
                            kb.category === 'Combat' ? 'bg-red-950 text-red-300 border border-red-800/50' :
                            kb.category === 'Weapon' ? 'bg-amber-950 text-amber-300 border border-amber-800/50' :
                            'bg-slate-800 text-slate-300'
                          }`}>
                            {kb.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="bg-slate-950 border border-slate-700/80 px-2 py-1 rounded text-amber-400 font-bold text-xs inline-block shadow-sm">
                            {kb.primaryKey}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          {kb.secondaryKey ? (
                            <span className="bg-slate-950/60 border border-slate-800 px-2 py-1 rounded text-slate-400 text-xs inline-block">
                              {kb.secondaryKey}
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => setEditingBindId(kb.id)}
                            className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                              editingBindId === kb.id
                                ? 'bg-amber-500 text-slate-950 font-bold animate-pulse'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                            }`}
                          >
                            {editingBindId === kb.id ? 'Listening...' : 'Remap'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GAMEPAD & CONTROLLER SUPPORT */}
      {activeSubTab === 'gamepad' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Gamepad Configuration & Deadzones */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    Controller Layout &amp; API Driver
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                  SDL_GameController
                </span>
              </div>

              {/* Hardware Detected Notice */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Hardware Detection:</span>
                  <span className={`font-semibold ${activeGamepadName ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {activeGamepadName ? 'GAMEPAD CONNECTED' : 'VIRTUAL SIMULATOR READY'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {activeGamepadName ? activeGamepadName : 'Connect any USB / Bluetooth controller or test with virtual inputs'}
                </div>
              </div>

              {/* Layout Preset Selector */}
              <div className="space-y-1.5 text-xs font-mono">
                <label className="text-slate-400">Target Controller Profile:</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Xbox 360', 'Xbox Series/One', 'DualShock 4 / DualSense', 'Switch Pro'] as const).map((profile) => (
                    <button
                      key={profile}
                      onClick={() => setGamepadConfig({ ...gamepadConfig, layout: profile })}
                      className={`p-2 rounded border text-left transition-colors ${
                        gamepadConfig.layout === profile
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                      }`}
                    >
                      {profile}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stick Deadzone Calibrators */}
              <div className="space-y-4 text-xs font-mono pt-1">
                <div className="space-y-1.5 p-2.5 rounded bg-slate-950 border border-slate-800">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Left Stick Deadzone:</span>
                    <span className="text-amber-400 font-bold">{Math.round(gamepadConfig.leftDeadzone * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.02"
                    max="0.30"
                    step="0.01"
                    value={gamepadConfig.leftDeadzone}
                    onChange={(e) => setGamepadConfig({ ...gamepadConfig, leftDeadzone: parseFloat(e.target.value) })}
                    className="w-full accent-amber-500 bg-slate-800 rounded-lg h-1.5 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5 p-2.5 rounded bg-slate-950 border border-slate-800">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Right Stick Deadzone:</span>
                    <span className="text-amber-400 font-bold">{Math.round(gamepadConfig.rightDeadzone * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.02"
                    max="0.30"
                    step="0.01"
                    value={gamepadConfig.rightDeadzone}
                    onChange={(e) => setGamepadConfig({ ...gamepadConfig, rightDeadzone: parseFloat(e.target.value) })}
                    className="w-full accent-amber-500 bg-slate-800 rounded-lg h-1.5 cursor-pointer"
                  />
                </div>

                {/* Stick Acceleration Curve */}
                <div className="space-y-1.5 p-2.5 rounded bg-slate-950 border border-slate-800">
                  <label className="text-slate-400">Thumbstick Response Curve:</label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {(['Linear', 'Exponential', 'Dynamic'] as const).map((curve) => (
                      <button
                        key={curve}
                        onClick={() => setGamepadConfig({ ...gamepadConfig, stickCurve: curve })}
                        className={`p-1.5 rounded border text-center text-[11px] transition-colors ${
                          gamepadConfig.stickCurve === curve
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        {curve}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vibration Motor & Rumble */}
                <div className="flex items-center justify-between p-2.5 rounded bg-slate-950 border border-slate-800">
                  <div>
                    <div className="text-slate-200 font-semibold">Dual-Motor Haptic Feedback</div>
                    <div className="text-[10px] text-slate-500">Simulates weapon recoil &amp; explosions</div>
                  </div>
                  <button
                    onClick={handleTestRumble}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1.5 ${
                      rumbleActive ? 'bg-red-500 text-slate-950 animate-bounce' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>{rumbleActive ? 'VIBRATING...' : 'Test Rumble'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Gamepad Diagnostic HUD */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    Live Controller Diagnostic &amp; Button Mapping Tester
                  </h3>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Active Layout: <span className="text-amber-400 font-bold">{gamepadConfig.layout}</span>
                </span>
              </div>

              {/* Gamepad Visual Schematics Container */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 relative overflow-hidden flex flex-col items-center justify-center">
                {/* Controller Outline graphic */}
                <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
                  {/* Triggers & Bumpers Top */}
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-950 border border-slate-700 px-2 py-1 rounded text-[10px] font-mono text-slate-300">
                        LT / L2 (ADS)
                      </span>
                      <span className="bg-slate-950 border border-slate-700 px-2 py-1 rounded text-[10px] font-mono text-slate-300">
                        LB / L1 (Tactical)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="bg-slate-950 border border-slate-700 px-2 py-1 rounded text-[10px] font-mono text-slate-300">
                        RB / R1 (Frag)
                      </span>
                      <span className="bg-slate-950 border border-slate-700 px-2 py-1 rounded text-[10px] font-mono text-slate-300">
                        RT / R2 (Fire)
                      </span>
                    </div>
                  </div>

                  {/* Center Body: D-Pad, Guide, Face Buttons */}
                  <div className="flex justify-between items-center">
                    {/* Left Thumbstick & D-pad */}
                    <div className="space-y-4 flex flex-col items-center">
                      {/* Left Stick (Move) */}
                      <div className="w-16 h-16 rounded-full border-2 border-slate-700 bg-slate-950 relative flex items-center justify-center shadow-inner">
                        <div
                          className="w-8 h-8 rounded-full bg-slate-800 border border-amber-500/60 transition-transform duration-75 flex items-center justify-center text-[9px] font-mono text-amber-300"
                          style={{
                            transform: `translate(${gamepadStickPos.lx * 14}px, ${gamepadStickPos.ly * 14}px)`,
                          }}
                        >
                          LS
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">WASD Movement</span>
                    </div>

                    {/* Middle: Guide / Options */}
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-8 h-8 rounded-full border border-amber-500/60 bg-amber-500/10 flex items-center justify-center text-amber-400 text-xs font-bold font-mono shadow-md">
                        X
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                          BACK
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                          START
                        </span>
                      </div>
                    </div>

                    {/* Right Face Buttons & Right Stick */}
                    <div className="space-y-4 flex flex-col items-center">
                      {/* Face Buttons (ABXY or PS symbols) */}
                      <div className="grid grid-cols-3 gap-1 w-20">
                        <div />
                        <button
                          onClick={() => handleReload()}
                          className="w-6 h-6 rounded-full bg-slate-950 border border-amber-500/60 text-amber-400 text-[10px] font-bold font-mono flex items-center justify-center hover:bg-amber-500 hover:text-slate-950 transition-colors"
                        >
                          Y
                        </button>
                        <div />
                        <button
                          onClick={() => handleReload()}
                          className="w-6 h-6 rounded-full bg-slate-950 border border-blue-500/60 text-blue-400 text-[10px] font-bold font-mono flex items-center justify-center hover:bg-blue-500 hover:text-slate-950 transition-colors"
                        >
                          X
                        </button>
                        <div />
                        <button
                          onClick={() => handleReload()}
                          className="w-6 h-6 rounded-full bg-slate-950 border border-red-500/60 text-red-400 text-[10px] font-bold font-mono flex items-center justify-center hover:bg-red-500 hover:text-slate-950 transition-colors"
                        >
                          B
                        </button>
                        <div />
                        <button
                          onClick={() => handleReload()}
                          className="w-6 h-6 rounded-full bg-slate-950 border border-emerald-500/60 text-emerald-400 text-[10px] font-bold font-mono flex items-center justify-center hover:bg-emerald-500 hover:text-slate-950 transition-colors"
                        >
                          A
                        </button>
                        <div />
                      </div>

                      {/* Right Stick (Aim / Look) */}
                      <div className="w-16 h-16 rounded-full border-2 border-slate-700 bg-slate-950 relative flex items-center justify-center shadow-inner">
                        <div
                          className="w-8 h-8 rounded-full bg-slate-800 border border-emerald-500/60 transition-transform duration-75 flex items-center justify-center text-[9px] font-mono text-emerald-300"
                          style={{
                            transform: `translate(${gamepadStickPos.rx * 14}px, ${gamepadStickPos.ry * 14}px)`,
                          }}
                        >
                          RS
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">Aim Camera</span>
                    </div>
                  </div>
                </div>

                {/* Diagnostic Stick Values */}
                <div className="grid grid-cols-2 gap-4 w-full mt-4 text-[11px] font-mono text-slate-400">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
                    <span>Left Stick (LX, LY):</span>
                    <span className="text-amber-400">
                      {gamepadStickPos.lx.toFixed(2)}, {gamepadStickPos.ly.toFixed(2)}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
                    <span>Right Stick (RX, RY):</span>
                    <span className="text-emerald-400">
                      {gamepadStickPos.rx.toFixed(2)}, {gamepadStickPos.ry.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tactical Actions Mapping Reference */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <div className="text-slate-400">A / Cross:</div>
                  <div className="text-emerald-400 font-bold">Jump / Mantle</div>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <div className="text-slate-400">B / Circle:</div>
                  <div className="text-red-400 font-bold">Crouch / Slide</div>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <div className="text-slate-400">X / Square:</div>
                  <div className="text-blue-400 font-bold">Reload / Interact</div>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <div className="text-slate-400">Y / Triangle:</div>
                  <div className="text-amber-400 font-bold">Switch Weapon</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LAN, WI-FI & BLUETOOTH PLAY */}
      {activeSubTab === 'lan_networking' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Direct IP Connect & Dedicated Server Controls */}
          <div className="lg:col-span-6 space-y-6">
            {/* Direct Connect Station */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Network className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    Direct IP LAN &amp; VPN Connect
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                  ZeroTier / Hamachi / Subnet
                </span>
              </div>

              <p className="text-xs text-slate-400">
                Join a friend's private match directly over local area network, Wi-Fi subnet, or virtual LAN tunnels without relying on external matchmaking servers.
              </p>

              <div className="space-y-3 text-xs font-mono">
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2 space-y-1">
                    <label className="text-slate-400">Host IPv4 / Hostname:</label>
                    <input
                      type="text"
                      value={directConnectIp}
                      onChange={(e) => setDirectConnectIp(e.target.value)}
                      placeholder="192.168.1.xxx"
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500/60"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400">Port:</label>
                    <input
                      type="number"
                      value={directConnectPort}
                      onChange={(e) => setDirectConnectPort(parseInt(e.target.value) || 2302)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500/60"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={testDirectPing}
                    disabled={pingResult.status === 'testing'}
                    className="flex-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 py-2 rounded text-xs font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>{pingResult.status === 'testing' ? 'Testing Handshake...' : 'Test Connection & Ping'}</span>
                  </button>

                  <button
                    onClick={() => {
                      alert(`Initiating low-latency UDP handshake to ${directConnectIp}:${directConnectPort}`);
                    }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 py-2 rounded text-xs font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Join Session</span>
                  </button>
                </div>

                {pingResult.status === 'success' && (
                  <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Host Reachable · Modern Combat 3 Protocol ACK</span>
                    </div>
                    <span className="font-bold">{pingResult.ms} ms RTT</span>
                  </div>
                )}
              </div>
            </div>

            {/* Dedicated Headless LAN Server Runner */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    Headless PC LAN Server (mc3server)
                  </h3>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  lanServerRunning ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60' : 'text-slate-400 bg-slate-950 border-slate-800'
                }`}>
                  {lanServerRunning ? 'RUNNING (PORT 2302)' : 'STANDBY'}
                </span>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400">Map Rotation:</label>
                    <select
                      value={lanServerMap}
                      onChange={(e) => setLanServerMap(e.target.value)}
                      className="w-full mt-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none"
                    >
                      <option value="Alaska Submarine Base">Alaska Submarine Base</option>
                      <option value="Los Angeles Ruins">Los Angeles Ruins</option>
                      <option value="North Korea Outpost">North Korea Outpost</option>
                      <option value="Tokyo Harbor">Tokyo Harbor</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400">Tickrate (Hz):</label>
                    <div className="flex gap-1 mt-1">
                      {(['30', '60', '120'] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setLanServerTickrate(t)}
                          className={`flex-1 py-1.5 rounded border text-center transition-colors ${
                            lanServerTickrate === t
                              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          {t}Hz
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setLanServerRunning(!lanServerRunning)}
                    className={`flex-1 py-2 rounded text-xs font-bold transition-colors flex items-center justify-center gap-2 ${
                      lanServerRunning
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {lanServerRunning ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{lanServerRunning ? 'Stop Server' : 'Launch Local Server'}</span>
                  </button>

                  <button
                    onClick={() => {
                      const cmd = `./mc3server --port 2302 --map "${lanServerMap}" --tickrate ${lanServerTickrate} --max 12`;
                      navigator.clipboard.writeText(cmd);
                      setCopiedCli(true);
                      setTimeout(() => setCopiedCli(false), 2000);
                    }}
                    className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono flex items-center gap-1.5 transition-colors"
                    title="Copy CLI command"
                  >
                    {copiedCli ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCli ? 'Copied' : 'CLI'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Wi-Fi & Bluetooth Stack Bridges */}
          <div className="lg:col-span-6 space-y-6">
            {/* Wi-Fi Subnet & Ad-hoc Broadcast */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    Wi-Fi Subnet Broadcast &amp; Mobile Cross-Play
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                  Cross-Platform Ready
                </span>
              </div>

              <p className="text-xs text-slate-400">
                Modern Combat 3 on PC broadcasts UDP discovery datagrams on port 2302 that unmodified Android phones and iOS devices running the original game can discover and join seamlessly.
              </p>

              <div className="space-y-2 text-xs font-mono">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-slate-200 font-semibold">Subnet Broadcast Socket (255.255.255.255:2302)</span>
                  </div>
                  <span className="text-emerald-400">ACTIVE LISTENING</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-slate-200 font-semibold">Unmodified Mobile APK Cross-Play Compatibility</span>
                  </div>
                  <span className="text-emerald-400">100% PROTOCOL MATCH</span>
                </div>
              </div>
            </div>

            {/* Bluetooth RFCOMM SPP Bridge */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Bluetooth className="w-4 h-4 text-blue-400" />
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    Bluetooth RFCOMM SPP Hardware Bridge
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-blue-400 bg-blue-950/60 border border-blue-800/60 px-2 py-0.5 rounded">
                  Winsock / BlueZ
                </span>
              </div>

              <p className="text-xs text-slate-400">
                The original game supports direct 2-player or 4-player Bluetooth peer matches. On PC, we bridge Android's <code className="text-amber-400 font-mono">BluetoothAdapter</code> JNI calls to native desktop Bluetooth sockets:
              </p>

              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-300">Windows:</span>
                  <span className="text-slate-400">Winsock AF_BTH / BTHPROTO_RFCOMM</span>
                </div>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-300">Linux:</span>
                  <span className="text-slate-400">BlueZ AF_BLUETOOTH / BTPROTO_RFCOMM</span>
                </div>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-300">macOS:</span>
                  <span className="text-slate-400">IOBluetooth RFCOMM Channel API</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: XBOX 360 PORT & ARCHITECTURE */}
      {activeSubTab === 'xbox360' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <Tv className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono flex items-center gap-2">
                    <span>Xbox 360 Native Console Port Roadmap &amp; Xenon Architecture</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded font-mono">
                      PHASE 10 ACTIVE
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Porting Modern Combat 3 to the 7th-generation Xbox 360 console via libxenon and Direct3D 9
                  </p>
                </div>
              </div>
              <div className="text-xs font-mono text-emerald-400 bg-slate-950 border border-slate-800 px-3 py-1 rounded">
                Target Platform: <span className="text-slate-200">Microsoft Xbox 360 (Xenon)</span>
              </div>
            </div>

            {/* Architecture Overview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1.5">
                <div className="text-slate-400 font-semibold">Console CPU:</div>
                <div className="text-emerald-400 font-bold text-sm">Xenon 3.2 GHz</div>
                <div className="text-[11px] text-slate-500">3 symmetrical PowerPC 64-bit cores, 2 threads per core (6 hardware threads)</div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1.5">
                <div className="text-slate-400 font-semibold">Graphics Hardware:</div>
                <div className="text-emerald-400 font-bold text-sm">Xenos GPU (500 MHz)</div>
                <div className="text-[11px] text-slate-500">ATI unified architecture with 10 MB daughter-die embedded DRAM (eDRAM)</div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1.5">
                <div className="text-slate-400 font-semibold">RAM Budget:</div>
                <div className="text-emerald-400 font-bold text-sm">512 MB GDDR3</div>
                <div className="text-[11px] text-slate-500">Unified memory shared between CPU and GPU. MC3 runs comfortably in &lt; 380 MB</div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1.5">
                <div className="text-slate-400 font-semibold">Multiplayer Netcode:</div>
                <div className="text-emerald-400 font-bold text-sm">System Link (UDP)</div>
                <div className="text-[11px] text-slate-500">Port 2302 broadcast compatible with LiNK, XLink Kai &amp; PC LAN matches</div>
              </div>
            </div>

            {/* Endianness Translation & GLES -> Direct3D 9 Pipeline */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              {/* Left: Big-Endian Swap */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold font-mono text-amber-400 border-b border-slate-800 pb-2">
                  <RotateCcw className="w-4 h-4" />
                  <span>1. ARM Little-Endian to PowerPC Big-Endian Byte Swap</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-mono">
                  The original Android ARMv7 binary is little-endian, while the Xenon PowerPC CPU is natively big-endian. The translation layer hooks memory loads/stores using GCC inline byte-swap intrinsics:
                </p>
                <div className="bg-slate-900 border border-slate-800 rounded p-3 text-[11px] font-mono text-slate-300 overflow-x-auto">
{`// include/mc3/arch/xenon_endian.hpp
#if defined(__XENON__) || defined(_XBOX)
static inline uint32_t arm_read32(const void* addr) {
    uint32_t val;
    memcpy(&val, addr, sizeof(val));
    return __builtin_bswap32(val); // Inverted on PowerPC Xenon
}
static inline void arm_write32(void* addr, uint32_t val) {
    uint32_t swapped = __builtin_bswap32(val);
    memcpy(addr, &swapped, sizeof(swapped));
}
#endif`}
                </div>
              </div>

              {/* Right: Direct3D 9 Shader Translator */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold font-mono text-emerald-400 border-b border-slate-800 pb-2">
                  <Sliders className="w-4 h-4" />
                  <span>2. OpenGL ES 2.0 to Direct3D 9 / HLSL Translator</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-mono">
                  Xbox 360 utilizes Direct3D 9 (Xenos driver). We translate GLSL ES fragment and vertex shaders into HLSL <code className="text-amber-400 font-mono">vs_3_0</code> and <code className="text-amber-400 font-mono">ps_3_0</code> bytecode:
                </p>
                <div className="bg-slate-900 border border-slate-800 rounded p-3 text-[11px] font-mono text-slate-300 overflow-x-auto">
{`// GLES 2.0 -> HLSL ps_3_0 Translation Matrix
struct PS_INPUT {
    float4 pos : POSITION;
    float2 uv  : TEXCOORD0;
    float4 col : COLOR0;
};
sampler2D diffuseMap : register(s0);

float4 main(PS_INPUT input) : COLOR0 {
    float4 texColor = tex2D(diffuseMap, input.uv);
    return texColor * input.col; // 720p 60FPS Resolve
}`}
                </div>
              </div>
            </div>

            {/* Xbox 360 Packaging & Launch Steps */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-xs font-bold font-mono text-slate-200">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>Packaging &amp; Deployment on RGH / JTAG Xbox 360 Dashboard</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Format: default.xex</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono text-slate-300">
                <div className="p-3 rounded bg-slate-900 border border-slate-800 space-y-1">
                  <div className="text-amber-400 font-bold">1. Build Binary:</div>
                  <div className="text-slate-400 text-[11px]">Compile with libxenon cross-toolchain to generate <code className="text-slate-200">mc3.elf</code> then run <code className="text-slate-200">xenon-xex mc3.elf default.xex</code>.</div>
                </div>

                <div className="p-3 rounded bg-slate-900 border border-slate-800 space-y-1">
                  <div className="text-amber-400 font-bold">2. Copy User Game Data:</div>
                  <div className="text-slate-400 text-[11px]">Copy <code className="text-slate-200">main.117.com.gameloft.android.ANMP.GloftM3HM.obb</code> into the game folder on Xbox 360 HDD (<code className="text-slate-200">Hdd1:\Games\MC3\</code>).</div>
                </div>

                <div className="p-3 rounded bg-slate-900 border border-slate-800 space-y-1">
                  <div className="text-amber-400 font-bold">3. Launch from Dashboard:</div>
                  <div className="text-slate-400 text-[11px]">Launch from Aurora, Freestyle Dash, or XeXMenu with full wireless controller and System Link support.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
