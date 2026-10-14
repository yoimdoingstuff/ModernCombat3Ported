import React, { useState, useEffect } from 'react';
import { GUEST_MEMORY_SEGMENTS, INITIAL_INSTRUCTIONS } from '../data/mc3Data';
import { CpuRegisterState, TrampolineCall } from '../types/mc3';
import { 
  Cpu, 
  Play, 
  Pause, 
  RotateCcw, 
  ArrowRight, 
  Layers, 
  Activity, 
  Radio, 
  Sparkles,
  Zap,
  Terminal
} from 'lucide-react';

export const ArmTranslationTab: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [registers, setRegisters] = useState<CpuRegisterState>({
    r0: 0xF0000001, // JNIEnv* or JavaVM*
    r1: 0x80B20000,
    r2: 0x00000000,
    r3: 0x00010006, // JNI_VERSION_1_6
    r4: 0x00000000,
    r5: 0x00000000,
    r6: 0x00000000,
    r7: 0x00000000,
    r8: 0x00000000,
    r9: 0x00000000,
    r10: 0x00000000,
    r11: 0xB007FF80, // Frame pointer
    r12: 0x00000000, // Intra-procedure scratch
    r13: 0xB007FF78, // SP
    r14: 0x8023E450, // LR
    r15: 0x8023E450, // PC
    cpsr: { N: false, Z: true, C: false, V: false, T: false },
  });

  const [trampolineLogs, setTrampolineLogs] = useState<TrampolineCall[]>([
    {
      id: 'log-1',
      timestamp: '00:00.012',
      symbol: 'pthread_mutex_init',
      category: 'POSIX Thread',
      args: ['0x80B24040', 'NULL'],
      returnValue: '0 (OK)',
    },
    {
      id: 'log-2',
      timestamp: '00:00.024',
      symbol: '__android_log_print',
      category: 'Bionic Libc',
      args: ['ANDROID_LOG_INFO', '"MC3"', '"Engine startup initialized"'],
      returnValue: '28',
    },
    {
      id: 'log-3',
      timestamp: '00:00.035',
      symbol: 'AAssetManager_open',
      category: 'Android FS',
      args: ['0x90001000', '"assets/data.pack"', 'AASSET_MODE_STREAMING'],
      returnValue: '0x90004500 (AAsset*)',
    },
  ]);

  const stepInstruction = () => {
    setCurrentStep((prev) => {
      const next = (prev + 1) % INITIAL_INSTRUCTIONS.length;
      const nextInstr = INITIAL_INSTRUCTIONS[next];

      // Mutate simulated registers
      setRegisters((reg) => ({
        ...reg,
        r15: parseInt(nextInstr.address, 16),
        r0: (reg.r0 + (next * 4)) & 0xFFFFFFFF,
        r1: (reg.r1 + 8) & 0xFFFFFFFF,
        r13: reg.r13 - (next === 0 ? 8 : next === INITIAL_INSTRUCTIONS.length - 1 ? -8 : 0),
        cpsr: {
          ...reg.cpsr,
          Z: next % 2 === 0,
        },
      }));

      if (next === 6) {
        // BLX GetEnv
        setTrampolineLogs((logs) => [
          {
            id: `log-${Date.now()}`,
            timestamp: `00:00.${(70 + next * 5).toString().padStart(3, '0')}`,
            symbol: 'JNIEnv::GetEnv',
            category: 'JNI',
            args: ['JavaVM* 0xF0000001', '&JNIEnv*', '0x10006'],
            returnValue: '0 (JNI_OK)',
          },
          ...logs.slice(0, 5),
        ]);
      }

      return next;
    });
  };

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning) {
      timer = setInterval(stepInstruction, 600);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning]);

  const resetSimulation = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setRegisters({
      r0: 0xF0000001,
      r1: 0x80B20000,
      r2: 0x00000000,
      r3: 0x00010006,
      r4: 0x00000000,
      r5: 0x00000000,
      r6: 0x00000000,
      r7: 0x00000000,
      r8: 0x00000000,
      r9: 0x00000000,
      r10: 0x00000000,
      r11: 0xB007FF80,
      r12: 0x00000000,
      r13: 0xB007FF78,
      r14: 0x8023E450,
      r15: 0x8023E450,
      cpsr: { N: false, Z: true, C: false, V: false, T: false },
    });
  };

  const toHex = (val: number) => `0x${(val >>> 0).toString(16).toUpperCase().padStart(8, '0')}`;

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 mt-1">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-sans">
                ARMv7 Execution Subsystem &amp; Dynarmic A32 JIT Architecture
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                MC3's native 32-bit ARM ELF is loaded into a flat 4GB virtual address space. <span className="text-slate-200 font-mono">Dynarmic A32</span> dynamically recompiles ARMv7 instructions (ARM/Thumb) into host x86-64 machine code basic blocks. Native Android imports (Bionic libc, POSIX threads, EGL/GLES, JNI) are intercepted by import trampolines and executed natively by host C++ shims.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isRunning ? 'Pause JIT' : 'Run JIT Stepper'}</span>
            </button>

            <button
              onClick={stepInstruction}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-50"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Step (1)</span>
            </button>

            <button
              onClick={resetSimulation}
              className="p-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700"
              title="Reset Registers & PC"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: CPU Registers & Instruction Stepper */}
        <div className="lg:col-span-7 space-y-6">
          {/* Guest CPU Registers Matrix */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                  Guest ARMv7 Registers (Dynarmic A32 State)
                </h3>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono">
                <span className="text-slate-500">CPSR:</span>
                <span className={`px-1 rounded ${registers.cpsr.N ? 'bg-amber-500/20 text-amber-300' : 'text-slate-600'}`}>N</span>
                <span className={`px-1 rounded ${registers.cpsr.Z ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-600'}`}>Z</span>
                <span className={`px-1 rounded ${registers.cpsr.C ? 'bg-amber-500/20 text-amber-300' : 'text-slate-600'}`}>C</span>
                <span className={`px-1 rounded ${registers.cpsr.V ? 'bg-amber-500/20 text-amber-300' : 'text-slate-600'}`}>V</span>
                <span className={`px-1 rounded ${registers.cpsr.T ? 'bg-blue-500/20 text-blue-300' : 'text-slate-600'}`}>T</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              {[
                { name: 'R0', val: registers.r0, note: 'arg0 / ret' },
                { name: 'R1', val: registers.r1, note: 'arg1' },
                { name: 'R2', val: registers.r2, note: 'arg2' },
                { name: 'R3', val: registers.r3, note: 'arg3' },
                { name: 'R4', val: registers.r4, note: 'variable' },
                { name: 'R5', val: registers.r5, note: 'variable' },
                { name: 'R6', val: registers.r6, note: 'variable' },
                { name: 'R7', val: registers.r7, note: 'syscall / var' },
                { name: 'R8', val: registers.r8, note: 'variable' },
                { name: 'R9', val: registers.r9, note: 'variable' },
                { name: 'R10', val: registers.r10, note: 'variable' },
                { name: 'R11 (FP)', val: registers.r11, note: 'frame ptr' },
                { name: 'R12 (IP)', val: registers.r12, note: 'scratch' },
                { name: 'R13 (SP)', val: registers.r13, note: 'stack ptr' },
                { name: 'R14 (LR)', val: registers.r14, note: 'link reg' },
                { name: 'R15 (PC)', val: registers.r15, note: 'program ctr' },
              ].map((reg) => (
                <div
                  key={reg.name}
                  className={`bg-slate-950/70 border rounded p-2 transition-colors ${
                    reg.name.includes('PC')
                      ? 'border-amber-500/50 bg-amber-950/20'
                      : 'border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span className="font-bold text-slate-400">{reg.name}</span>
                    <span>{reg.note}</span>
                  </div>
                  <div className="text-xs text-amber-300/90 font-semibold mt-0.5">
                    {toHex(reg.val)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instruction Disassembly Stream */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                  Live ARMv7 Disassembly Stream (libModernCombat3.so JNI_OnLoad)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <Zap className="w-3 h-3" /> JIT ACTIVE
              </span>
            </div>

            <div className="space-y-1 font-mono text-xs overflow-x-auto">
              {INITIAL_INSTRUCTIONS.map((instr, idx) => {
                const isCurrent = idx === currentStep;
                return (
                  <div
                    key={instr.address}
                    className={`flex items-center gap-3 px-3 py-1.5 rounded transition-colors ${
                      isCurrent
                        ? 'bg-amber-500/20 border border-amber-500/40 text-amber-200'
                        : 'text-slate-400 hover:bg-slate-800/40'
                    }`}
                  >
                    <span className="w-4 text-amber-400 font-bold">
                      {isCurrent ? '▶' : ' '}
                    </span>
                    <span className="text-slate-500">{instr.address}</span>
                    <span className="text-slate-600 text-[11px]">{instr.opcode}</span>
                    <span className="text-amber-400 font-semibold w-14">{instr.mnemonic}</span>
                    <span className="text-slate-200 min-w-[120px]">{instr.operands}</span>
                    <span className="text-slate-500 text-[11px] italic">
                      // {instr.comment}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 5 Columns: 4GB Guest Memory Map & Import Trampolines */}
        <div className="lg:col-span-5 space-y-6">
          {/* Guest Virtual Address Space Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  4GB Guest Virtual Memory Layout
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">32-bit Flat</span>
            </div>

            <div className="space-y-2.5">
              {GUEST_MEMORY_SEGMENTS.map((seg) => (
                <div
                  key={seg.name}
                  className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">{seg.name}</span>
                    <span className="font-mono text-[11px] text-amber-400 bg-amber-950/40 px-1 rounded">
                      {seg.protection}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>{seg.startAddress} - {seg.endAddress}</span>
                    <span className="text-slate-500">{(seg.sizeBytes / 1024).toFixed(0)} KB</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{seg.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Import Trampoline Call Log */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Host Import Trampoline Interceptions
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-500">Live ABI Trace</span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              {trampolineLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5 space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-amber-400 font-semibold">{log.symbol}</span>
                    <span className="text-slate-500">{log.timestamp}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    Args: <span className="text-slate-300">{log.args.join(', ')}</span>
                  </div>
                  <div className="text-[11px] text-emerald-400 flex justify-between">
                    <span>Ret: {log.returnValue}</span>
                    <span className="text-slate-600 text-[10px]">{log.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
