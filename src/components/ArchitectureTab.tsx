import React, { useState } from 'react';
import { ROADMAP_MILESTONES } from '../data/mc3Data';
import { ALL_ROADMAP_TASKS, getRoadmapStatistics, TaskStatus, PhaseTask } from '../data/roadmapTasks';
import { 
  Layers, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Cpu, 
  ShieldCheck, 
  Terminal, 
  Sparkles,
  GitCommit,
  GitBranch,
  Activity,
  Check,
  Search,
  Circle,
  HelpCircle,
  BarChart3,
  Target,
  Tv,
  Gamepad2,
  Share2
} from 'lucide-react';

export const ArchitectureTab: React.FC = () => {
  const [filter, setFilter] = useState<'ALL' | 'COMPLETED' | 'IN_PROGRESS' | 'PLANNED'>('ALL');
  const [taskStatusFilter, setTaskStatusFilter] = useState<'ALL' | TaskStatus>('ALL');
  const [taskCategoryFilter, setTaskCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const stats = getRoadmapStatistics();

  const filteredTasks = ALL_ROADMAP_TASKS.filter((task) => {
    if (taskStatusFilter !== 'ALL' && task.status !== taskStatusFilter) return false;
    if (taskCategoryFilter !== 'ALL' && task.category !== taskCategoryFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(q) ||
        task.phaseTitle.toLowerCase().includes(q) ||
        task.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredMilestones = ROADMAP_MILESTONES.filter((m) => {
    if (filter === 'ALL') return true;
    return m.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 mt-1">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-sans">
                Project Architecture, Progress Meter &amp; Roadmap Tracker
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-4xl leading-relaxed">
                MC3 Ported directly hosts the original Android ARMv7 binary using <span className="text-amber-400 font-mono">Dynarmic A32 JIT</span> and an SDL3 platform abstraction layer on Windows, Linux, and macOS. Use the live progress meter below to see exactly what has been completed, what is in active development, and what is remaining until the port reaches full release.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" />
              OVERALL PORT COMPLETION: {stats.percentComplete}%
            </span>
          </div>
        </div>
      </div>

      {/* Primary Project Progress Meter Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
                Project Completion Progress Meter
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Quantitative breakdown of milestones and roadmap deliverables
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-slate-400">Completed:</span>
              <span className="text-emerald-400 font-bold">{stats.completed}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-slate-400">In Progress:</span>
              <span className="text-amber-400 font-bold">{stats.inProgress}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
              <span className="text-slate-400">Remaining:</span>
              <span className="text-slate-300 font-bold">{stats.notStarted}</span>
            </div>
          </div>
        </div>

        {/* Master Multi-Segment Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-baseline text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-emerald-400">{stats.percentComplete}%</span>
              <span className="text-slate-400 uppercase tracking-wider font-semibold">Total Completed</span>
            </div>
            <span className="text-slate-400">
              {stats.completed} of {stats.total} Total Tasks Verified
            </span>
          </div>

          <div className="w-full bg-slate-950 h-4 rounded-full overflow-hidden flex border border-slate-800">
            {/* Completed Segment */}
            <div
              className="bg-emerald-500 h-full transition-all duration-500 ease-out flex items-center justify-center text-[10px] text-emerald-950 font-bold"
              style={{ width: `${stats.percentComplete}%` }}
              title={`Completed: ${stats.percentComplete}%`}
            >
              {stats.percentComplete > 15 ? `${stats.percentComplete}%` : ''}
            </div>

            {/* In Progress Segment */}
            <div
              className="bg-amber-500 h-full transition-all duration-500 ease-out flex items-center justify-center text-[10px] text-amber-950 font-bold"
              style={{ width: `${stats.percentActive}%` }}
              title={`In Progress: ${stats.percentActive}%`}
            >
              {stats.percentActive > 15 ? `${stats.percentActive}%` : ''}
            </div>

            {/* Remaining Segment */}
            <div
              className="bg-slate-800/80 h-full transition-all duration-500 ease-out"
              style={{ width: `${stats.percentRemaining}%` }}
              title={`Remaining: ${stats.percentRemaining}%`}
            />
          </div>

          <div className="flex justify-between text-[11px] font-mono text-slate-500 pt-1">
            <span>Milestone M1 (Foundation &amp; JIT Smoke)</span>
            <span>Milestone M3 (JNI Startup &amp; Asset Layer)</span>
            <span>Milestone M5 (Release &amp; Netplay)</span>
          </div>
        </div>

        {/* Category Breakdown Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {stats.categoryStats.map((cat) => (
            <div key={cat.category} className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-semibold">{cat.category}</span>
                <span className={`font-bold ${
                  cat.percent === 100 ? 'text-emerald-400' : cat.percent > 50 ? 'text-amber-400' : 'text-slate-400'
                }`}>
                  {cat.percent}%
                </span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800/60">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    cat.percent === 100 ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${cat.percent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>{cat.completed} / {cat.total} Tasks Finished</span>
                <span>{cat.total - cat.completed} Remaining</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive "What Is Done" vs "What Is Left" Checklist Explorer */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Detailed Project Roadmap Checklist (What Is &amp; Isn't Done)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Filter by status to inspect completed deliverables vs remaining work items
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search roadmap tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 font-mono placeholder:text-slate-600 focus:outline-none focus:border-amber-500/60"
            />
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setTaskStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded transition-colors ${
                taskStatusFilter === 'ALL'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Tasks ({stats.total})
            </button>
            <button
              onClick={() => setTaskStatusFilter('COMPLETED')}
              className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
                taskStatusFilter === 'COMPLETED'
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Done [x] ({stats.completed})</span>
            </button>
            <button
              onClick={() => setTaskStatusFilter('IN_PROGRESS')}
              className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
                taskStatusFilter === 'IN_PROGRESS'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Active [~] ({stats.inProgress})</span>
            </button>
            <button
              onClick={() => setTaskStatusFilter('NOT_STARTED')}
              className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
                taskStatusFilter === 'NOT_STARTED'
                  ? 'bg-slate-800 text-slate-300 font-bold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Circle className="w-3.5 h-3.5 text-slate-500" />
              <span>Remaining [ ] ({stats.notStarted})</span>
            </button>
          </div>

          {/* Category Dropdown Filter */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-500">Subsystem:</span>
            <select
              value={taskCategoryFilter}
              onChange={(e) => setTaskCategoryFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-300 focus:outline-none focus:border-amber-500/60"
            >
              <option value="ALL">All Subsystems</option>
              <option value="Foundation">Foundation</option>
              <option value="Core Runtime">Core Runtime &amp; JIT</option>
              <option value="Android ABI">Android ABI &amp; Shims</option>
              <option value="Platform & Graphics">Platform &amp; Graphics</option>
              <option value="PC Input & Controls">PC Input &amp; Controls</option>
              <option value="Multiplayer">Multiplayer &amp; Networking</option>
              <option value="Mods & Tools">Mods &amp; Tools</option>
              <option value="Xbox 360 Port">Xbox 360 Port (Xenon/D3D9)</option>
            </select>
          </div>
        </div>

        {/* Task Cards Grid */}
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs font-mono">
              No tasks found matching your criteria.
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`p-3 rounded-lg border text-xs flex items-center justify-between gap-3 transition-colors ${
                  task.status === 'COMPLETED'
                    ? 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/50'
                    : task.status === 'IN_PROGRESS'
                    ? 'bg-amber-950/15 border-amber-800/40 hover:bg-amber-950/25'
                    : 'bg-slate-950/40 border-slate-850 hover:bg-slate-900/40 opacity-75'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="shrink-0">
                    {task.status === 'COMPLETED' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : task.status === 'IN_PROGRESS' ? (
                      <Clock className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-600" />
                    )}
                  </div>
                  <div>
                    <div className="text-slate-200 font-medium font-sans">
                      {task.title}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>{task.phaseTitle}</span>
                      <span>·</span>
                      <span className="text-amber-400/80">{task.category}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 font-mono text-[10px]">
                  {task.status === 'COMPLETED' ? (
                    <span className="px-2 py-0.5 rounded font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                      DONE [x]
                    </span>
                  ) : task.status === 'IN_PROGRESS' ? (
                    <span className="px-2 py-0.5 rounded font-bold bg-amber-950/60 text-amber-400 border border-amber-800/60">
                      IN PROGRESS [~]
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded font-bold bg-slate-900 text-slate-500 border border-slate-800">
                      NOT STARTED [ ]
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ASCII Architectural Flow Diagram */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              MC3 Ported Subsystem Dataflow Diagram
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">architecture.md Reference</span>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs text-amber-300/90 whitespace-pre overflow-x-auto">
{`User-provided MC3 APK / OBB / Game Data
                  │
                  ▼
          Asset / Data Loader (miniz)
                  │
                  ▼
       Original ARMv7 libModernCombat3.so
                  │
                  ▼
      ARMv7 Dynarmic A32 JIT Execution Layer
                  │
                  ▼
          Compatibility ABI & Shims
   ┌──────────────┬──────────────┬──────────────┬──────────────┐
   │              │              │              │              │
  JNI           libc          EGL/GLES      Android IO     Networking
(FalsoJNI)    (Bionic)       (Desktop GL)   (/data/data)  (LAN / BT)
   │              │              │              │              │
   └──────────────┴──────────────┴──────────────┴──────────────┘
                  │
                  ▼
         PC Platform Layer (SDL3)
   ┌──────────────┬──────────────┬──────────────┬──────────────┐
   │              │              │              │              │
 SDL3 Window   Desktop GL      Audio        Direct Input   Local Sockets
(Widescreen)   (Core Profile) (WASAPI/Pulse) (Mouse / Pad)  (UDP / RFCOMM)
   │              │              │              │              │
   └──────────────┴──────────────┴──────────────┴──────────────┘
                  │
                  ▼
         Native OS: Windows · Linux · macOS`}
        </div>
      </div>

      {/* Comparison: PS Vita Loader vs MC3 Ported Desktop vs Xbox 360 */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <GitBranch className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
            Platform Target Comparison: PS Vita vs. Native PC vs. Xbox 360 (Xenon)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500">
                <th className="py-2.5">Subsystem</th>
                <th className="py-2.5">PS Vita Loader (v-atamanenko)</th>
                <th className="py-2.5">MC3 Ported (Native PC)</th>
                <th className="py-2.5 text-emerald-400">Xbox 360 Target (Xenon / D3D9)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-2 text-slate-400 font-semibold">CPU Execution</td>
                <td className="py-2">ARM Cortex-A9 (Native passthrough)</td>
                <td className="py-2 text-amber-300">Dynarmic A32 JIT (x86-64 / ARM64 host)</td>
                <td className="py-2 text-emerald-300">PowerPC Xenon 3.2GHz (PPC64 JIT + Endian Swap)</td>
              </tr>
              <tr>
                <td className="py-2 text-slate-400 font-semibold">Graphics API</td>
                <td className="py-2">PVR SGX543 / vitagl</td>
                <td className="py-2 text-emerald-400">SDL3 + Desktop OpenGL 3.3 Core / ANGLE</td>
                <td className="py-2 text-emerald-300">Direct3D 9 / Xenos EDRAM 720p Tiled Resolver</td>
              </tr>
              <tr>
                <td className="py-2 text-slate-400 font-semibold">Input Model</td>
                <td className="py-2">Dual analog sticks + touchscreen</td>
                <td className="py-2 text-amber-300">Raw mouse look + keyboard + gamepads (NO touch HUD)</td>
                <td className="py-2 text-emerald-300">Native XInput Wireless Controller (Guide button, rumble)</td>
              </tr>
              <tr>
                <td className="py-2 text-slate-400 font-semibold">Audio Backend</td>
                <td className="py-2">SceAudio / OpenSL bridge</td>
                <td className="py-2 text-emerald-400">SDL3 audio callback streams (WASAPI, PulseAudio)</td>
                <td className="py-2 text-emerald-300">XAudio2 5.1 positional surround sound engine</td>
              </tr>
              <tr>
                <td className="py-2 text-slate-400 font-semibold">Multiplayer</td>
                <td className="py-2">Ad-hoc Wi-Fi only</td>
                <td className="py-2 text-amber-300">Local Wi-Fi Subnet UDP + Local Bluetooth RFCOMM</td>
                <td className="py-2 text-emerald-300">Xbox 360 System Link (UDP port 2302 / LiNK / XLink Kai)</td>
              </tr>
              <tr>
                <td className="py-2 text-slate-400 font-semibold">Memory Budget</td>
                <td className="py-2">512 MB Main + 128 MB VRAM</td>
                <td className="py-2 text-emerald-400">&lt;50 MB runtime overhead on host OS</td>
                <td className="py-2 text-emerald-300">512 MB unified GDDR3 (&lt;380 MB active app budget)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Xbox 360 Xenon Architecture & System Link Deep Dive Card */}
      <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono flex items-center gap-2">
                <span>Xbox 360 Port: Xenon PowerPC Architecture &amp; System Link Roadmap</span>
                <span className="text-[10px] text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded font-mono">
                  ACTIVE ON ROADMAP
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Targeting homebrew JTAG/RGH Xbox 360 consoles running Aurora/Freestyle Dashboards
              </p>
            </div>
          </div>
          <div className="text-xs font-mono text-emerald-400 bg-slate-950 border border-slate-800 px-3 py-1 rounded">
            Target Binary: <span className="text-slate-200">mc3.xex</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <Cpu className="w-4 h-4" />
              <span>Xenon PowerPC 64-bit Core</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              3 symmetrical PowerPC cores @ 3.2 GHz with 2 hardware threads each (6 SMT threads). Uses VMX128 vector instruction extensions and inline byte-swap (<code className="text-amber-400 font-mono">__builtin_bswap32</code>) to bridge ARM little-endian data structures.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <Layers className="w-4 h-4" />
              <span>Xenos GPU &amp; Direct3D 9</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              ATI Xenos unified shader architecture with 10 MB daughter-die embedded DRAM (eDRAM). Translates OpenGL ES 2.0 shader bytecode into Direct3D 9 High-Level Shader Language (HLSL ps_3_0 / vs_3_0) with 720p tiled MSAA resolves.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <Share2 className="w-4 h-4" />
              <span>Xbox System Link &amp; LiNK</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              System Link netplay using standard UDP broadcast on port 2302. Fully compatible with PC LAN players, mobile Android/iOS Wi-Fi peers, and community tunnel services (FSD LiNK, XLink Kai, Unity) for global multiplayer.
            </p>
          </div>
        </div>

        {/* Technical Memory & Execution Topology */}
        <div className="bg-slate-950 border border-slate-800/90 rounded-lg p-3">
          <div className="text-[11px] font-mono text-slate-400 mb-2 font-semibold">
            XBOX 360 RUNTIME EXECUTION &amp; ENDIAN SWAP TOPOLOGY:
          </div>
          <pre className="text-[10px] text-slate-300 font-mono overflow-x-auto leading-relaxed">
{` [User APK Game Data] ──► miniz / OBB Loader ──► Big-Endian Byte Swap (__builtin_bswap32)
                                                        │
 ┌──────────────────────────────────────────────────────┴──────────────────────────────────────────────────────┐
 │ Xenon Triple-Core PowerPC 64-bit (3.2 GHz)                                                                 │
 │   Core 0, Thread 0: Main Game Loop & Gameloft Engine Tick                                                   │
 │   Core 1, Thread 0: ARMv7 JIT / Static Recompiler Block Cache                                              │
 │   Core 2, Thread 0: Direct3D 9 Command Stream & XAudio2 Mixing                                              │
 └──────────────────────────────────────────────────────┬──────────────────────────────────────────────────────┘
                                                        │
          ┌─────────────────────────────────────────────┴─────────────────────────────────────────────┐
          │                                                                                           │
          ▼                                                                                           ▼
  [Xenos GPU & 10MB eDRAM]                                                                 [Xbox System Link Netcode]
  GLES 2.0 ──► HLSL Vertex/Pixel Shaders 3.0                                               UDP Broadcast Port 2302
  720p Native Framebuffer (1280x720 60 FPS)                                                Cross-Play: PC · Android · iOS`}
          </pre>
        </div>
      </div>
    </div>
  );
};
