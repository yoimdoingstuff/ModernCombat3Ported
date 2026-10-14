import React from 'react';
import { ActiveTab } from '../types/mc3';
import { getRoadmapStatistics } from '../data/roadmapTasks';
import { 
  Cpu, 
  Package, 
  Wifi, 
  Terminal, 
  Layers, 
  HardDrive, 
  Monitor, 
  ShieldAlert,
  Radio,
  Puzzle,
  Hammer,
  Activity,
  CheckCircle2,
  Clock,
  Gamepad2
} from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const stats = getRoadmapStatistics();

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
      {/* Top Tactical Status Bar */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 px-4 py-1.5 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-amber-400 font-mono font-medium">
            <Radio className="w-3.5 h-3.5 animate-pulse text-amber-500" />
            TARGET: MODERN COMBAT 3 v1.1.7g (ARMv7)
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">PLATFORMS:</span>
            <span className="text-slate-300 font-mono">Windows</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-300 font-mono">Linux</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-300 font-mono">macOS</span>
            <span className="text-slate-600">·</span>
            <span className="text-emerald-400 font-mono">Xbox 360</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Live Progress Meter Badge in Top Bar */}
          <button
            onClick={() => onTabChange('architecture')}
            className="flex items-center gap-2 text-slate-300 hover:text-amber-300 font-mono text-[11px] bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 px-2.5 py-0.5 rounded transition-colors"
            title="Click to view full milestone task breakdown"
          >
            <Activity className="w-3 h-3 text-amber-400 animate-pulse" />
            <span className="text-slate-400">PORT PROGRESS:</span>
            <span className="text-emerald-400 font-bold">{stats.percentComplete}% COMPLETE</span>
            <div className="w-14 bg-slate-800 h-1.5 rounded-full overflow-hidden hidden sm:block">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.percentComplete}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 hidden md:inline">({stats.completed}/{stats.total} Tasks)</span>
          </button>

          {/* Strict Policy Reminder */}
          <div className="flex items-center gap-1.5 text-amber-300/90 bg-amber-950/40 border border-amber-800/60 px-2 py-0.5 rounded text-[11px] font-mono">
            <ShieldAlert className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">NATIVE PC RUNTIME ONLY · </span>NO WEB GAME PORT
          </div>

          {/* Storage Budget Indicator */}
          <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px] hidden lg:flex">
            <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
            <span>OVERHEAD:</span>
            <span className="text-emerald-400 font-semibold">28.4 MB</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-500">&lt;50 MB</span>
          </div>
        </div>
      </div>

      {/* Main Header & Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-emerald-500/10 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/5">
            <Monitor className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-wider text-slate-100 uppercase font-sans">
                MC3 Ported
              </h1>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.2 rounded">
                v0.1.0-alpha
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Modern Combat 3: Fallen Nation · Native PC Translation Layer &amp; Compatibility Runtime
            </p>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <nav className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-lg overflow-x-auto">
          <button
            onClick={() => onTabChange('inspector')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'inspector'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>APK / OBB Inspector</span>
          </button>

          <button
            onClick={() => onTabChange('arm_runtime')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'arm_runtime'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>ARMv7 Dynarmic JIT</span>
          </button>

          <button
            onClick={() => onTabChange('pc_features')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'pc_features'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>PC Controls &amp; Features</span>
          </button>

          <button
            onClick={() => onTabChange('multiplayer')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'multiplayer'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>Multiplayer (LAN, Wi-Fi &amp; BT)</span>
          </button>

          <button
            onClick={() => onTabChange('mods')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'mods'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Puzzle className="w-3.5 h-3.5" />
            <span>Mod Management</span>
          </button>

          <button
            onClick={() => onTabChange('builder')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'builder'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Hammer className="w-3.5 h-3.5" />
            <span>Desktop Builder &amp; CI</span>
          </button>

          <button
            onClick={() => onTabChange('builds')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'builds'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Native Code</span>
          </button>

          <button
            onClick={() => onTabChange('architecture')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'architecture'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Architecture &amp; Roadmap</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
