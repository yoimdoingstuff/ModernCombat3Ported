export type ActiveTab = 'inspector' | 'arm_runtime' | 'pc_features' | 'multiplayer' | 'mods' | 'builder' | 'builds' | 'architecture';

export interface KeyBinding {
  id: string;
  action: string;
  category: 'Movement' | 'Combat' | 'Weapon' | 'System';
  primaryKey: string;
  secondaryKey?: string;
  description: string;
}

export interface GamepadConfig {
  layout: 'Xbox 360' | 'Xbox Series/One' | 'DualShock 4 / DualSense' | 'Switch Pro';
  leftDeadzone: number;
  rightDeadzone: number;
  sensitivity: number;
  adsMultiplier: number;
  stickCurve: 'Linear' | 'Exponential' | 'Dynamic';
  rumbleEnabled: boolean;
  rumbleIntensity: number;
  invertY: boolean;
}

export interface WeaponModItem {
  id: string;
  name: string;
  baseWeapon: string;
  damage: number;
  fireRateRpm: number;
  magazineSize: number;
  recoil: number;
  modelFile: string;
  soundFile: string;
  vanillaSafe: boolean;
}

export interface MapModItem {
  id: string;
  name: string;
  mapFile: string;
  environment: string;
  maxPlayers: number;
  supportedModes: string[];
  thumbnail: string;
  vanillaSafe: boolean;
}

export interface ModItem {
  id: string;
  title: string;
  author: string;
  version: string;
  description: string;
  category: 'Weapon' | 'Map' | 'Texture' | 'Audio' | 'TotalConversion';
  enabled: boolean;
  vanillaSafe: boolean; // True if compatible with unmodified iOS/Android vanilla netplay
  sizeMB: number;
  weapons?: WeaponModItem[];
  maps?: MapModItem[];
}

export interface ApkPackageInfo {
  filename: string;
  version: string;
  packageId: string;
  fileSizeMB: number;
  armLibrary: {
    name: string;
    path: string;
    sizeMB: number;
    architecture: string;
    entryPoint: string;
    loadBase: string;
    e_machine: string;
    abi: string;
  };
  obbFile: {
    name: string;
    sizeMB: number;
    mountPath: string;
    crc32: string;
    sha256: string;
  };
  assetManifest: Array<{ path: string; sizeKB: number; compression: string }>;
  neededLibraries: string[];
}

export interface CpuRegisterState {
  r0: number;
  r1: number;
  r2: number;
  r3: number;
  r4: number;
  r5: number;
  r6: number;
  r7: number;
  r8: number;
  r9: number;
  r10: number;
  r11: number; // FP
  r12: number; // IP
  r13: number; // SP
  r14: number; // LR
  r15: number; // PC
  cpsr: {
    N: boolean; // Negative
    Z: boolean; // Zero
    C: boolean; // Carry
    V: boolean; // Overflow
    T: boolean; // Thumb mode
  };
}

export interface MemorySegment {
  name: string;
  startAddress: string;
  endAddress: string;
  sizeBytes: number;
  protection: 'R-X' | 'RW-' | 'R--' | '---';
  type: 'Guest ELF' | 'JIT Cache' | 'Bionic Heap' | 'Guest Stack' | 'JNI Trampolines' | 'Guard';
  description: string;
}

export interface InstructionLine {
  address: string;
  opcode: string;
  mnemonic: string;
  operands: string;
  comment?: string;
  isCurrent?: boolean;
}

export interface TrampolineCall {
  id: string;
  timestamp: string;
  symbol: string;
  category: 'JNI' | 'Bionic Libc' | 'POSIX Thread' | 'EGL / GLES' | 'Android FS' | 'OpenSL ES';
  args: string[];
  returnValue: string;
}

export interface PeerDevice {
  id: string;
  name: string;
  endpoint: string; // IP:port or Bluetooth MAC
  transport: 'WIFI_LAN' | 'BLUETOOTH_RFCOMM';
  pingMs: number;
  isHost: boolean;
  playerCount: number;
  maxPlayers: number;
  mapName: string;
  gameMode: string;
  status: 'HOSTING' | 'CONNECTED' | 'DISCOVERED';
}

export interface NetworkPacket {
  id: string;
  timestamp: string;
  direction: 'IN' | 'OUT';
  transport: 'WIFI_LAN' | 'BLUETOOTH_RFCOMM';
  magic: string;
  type: string;
  seq: number;
  sizeBytes: number;
  summary: string;
}

export interface RoadmapMilestone {
  phase: string;
  name: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PLANNED';
  description: string;
  files: string[];
}
