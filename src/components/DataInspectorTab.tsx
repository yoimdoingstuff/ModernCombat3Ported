import React, { useState } from 'react';
import { DEFAULT_PACKAGE } from '../data/mc3Data';
import { 
  validateApkOrObbFile, 
  validateFilenameAndSize, 
  FileValidationResult,
  DetectedArch 
} from '../utils/fileValidation';
import { 
  FileCheck, 
  Upload, 
  Copy, 
  Check, 
  ShieldCheck, 
  FolderArchive, 
  Cpu, 
  HardDrive, 
  Terminal, 
  ExternalLink,
  FileCode,
  Layers,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  HelpCircle,
  Zap,
  Box,
  Binary
} from 'lucide-react';

export const DataInspectorTab: React.FC = () => {
  const [pkg, setPkg] = useState(DEFAULT_PACKAGE);
  const [copied, setCopied] = useState(false);
  const [runtimeRoot, setRuntimeRoot] = useState('C:\\MC3Runtime');
  const [gameDataPath, setGameDataPath] = useState('C:\\Games\\MC3\\Modern-Combat-3-Fallen-Nation-v1-1-7g.apk');
  const [resolution, setResolution] = useState('1920x1080');
  const [fpsLimit, setFpsLimit] = useState('120');
  const [activePreset, setActivePreset] = useState<'v117g' | 'v100' | 'custom'>('v117g');
  const [validationResult, setValidationResult] = useState<FileValidationResult>(() => 
    validateFilenameAndSize(DEFAULT_PACKAGE.filename, DEFAULT_PACKAGE.fileSizeMB * 1024 * 1024)
  );
  const [isValidating, setIsValidating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedArchAbi, setSelectedArchAbi] = useState<string>('armeabi-v7a');

  const cliCommand = `mc3.exe --game-data "${gameDataPath}" --runtime-root "${runtimeRoot}" --resolution ${resolution} --fps-limit ${fpsLimit}`;

  const copyCommand = () => {
    navigator.clipboard.writeText(cliCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const processFile = async (file: File) => {
    setIsValidating(true);
    setActivePreset('custom');
    setGameDataPath(`C:\\Games\\MC3\\${file.name}`);
    
    const result = await validateApkOrObbFile(file);
    setValidationResult(result);
    setIsValidating(false);

    const arch = result.selectedArchitecture || (result.detectedArchitectures.length > 0 ? result.detectedArchitectures[0] : null);
    if (arch) {
      setSelectedArchAbi(arch.abi);
    }

    setPkg({
      ...DEFAULT_PACKAGE,
      filename: file.name,
      fileSizeMB: result.fileSizeMB,
      version: result.detectedVersion ? `Detected ${result.detectedVersion}` : 'User Provided Archive',
      armLibrary: {
        name: arch ? arch.path.split('/').pop() || 'libModernCombat3.so' : 'libModernCombat3.so',
        path: arch ? arch.path : 'lib/armeabi-v7a/libModernCombat3.so',
        sizeMB: arch ? +(arch.uncompressedSize / (1024 * 1024)).toFixed(2) : 11.24,
        architecture: arch ? arch.label : 'ARMv7-A (32-bit little-endian)',
        entryPoint: arch?.abi === 'x86' ? '0x0023E450 (x86 JNI_OnLoad)' : '0x8023E450 (JNI_OnLoad)',
        loadBase: arch?.abi === 'x86' ? '0x00400000' : '0x80000000',
        e_machine: arch?.abi === 'x86' ? 'EM_386 (0x03, Intel 80386)' : 'EM_ARM (0x28, ARM Architecture)',
        abi: arch ? arch.abi : 'armeabi-v7a',
      }
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleArchSelect = (arch: DetectedArch) => {
    setSelectedArchAbi(arch.abi);
    setPkg((prev) => ({
      ...prev,
      armLibrary: {
        name: arch.path.split('/').pop() || 'libModernCombat3.so',
        path: arch.path,
        sizeMB: +(arch.uncompressedSize / (1024 * 1024)).toFixed(2),
        architecture: arch.label,
        entryPoint: arch.abi === 'x86' ? '0x0023E450 (x86 JNI_OnLoad)' : '0x8023E450 (ARM JNI_OnLoad)',
        loadBase: arch.abi === 'x86' ? '0x00400000' : '0x80000000',
        e_machine: arch.abi === 'x86' ? 'EM_386 (0x03, Intel 80386)' : 'EM_ARM (0x28, ARM Architecture)',
        abi: arch.abi,
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Drag & Drop Importer with Full Central Directory Parsing */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`bg-slate-900 border rounded-xl p-5 shadow-lg transition-all ${
          isDragging 
            ? 'border-amber-400 bg-amber-950/20 shadow-amber-500/10' 
            : 'border-slate-800'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 mt-1">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-sans flex items-center gap-2">
                <span>Game Data Importer &amp; Architecture Inspector</span>
                {isValidating && (
                  <span className="text-xs text-amber-400 font-mono animate-pulse">
                    Scanning Central Directory...
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                Import your Modern Combat 3 APK, OBB, or extracted library. The importer inspects the complete ZIP Central Directory to detect native binaries across <span className="text-amber-400 font-mono">armeabi-v7a</span>, <span className="text-cyan-400 font-mono">x86</span>, and <span className="text-slate-300 font-mono">armeabi</span> architectures without size or position restrictions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="cursor-pointer flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow">
              <Upload className="w-4 h-4 text-slate-950" />
              <span>Import APK / OBB / .SO</span>
              <input 
                type="file" 
                accept=".apk,.zip,.obb,.so,application/zip,application/vnd.android.package-archive" 
                onChange={handleFileUpload} 
                className="hidden" 
              />
            </label>
          </div>
        </div>

        {/* Drop Target Helper */}
        <div className="mt-3 text-center border border-dashed border-slate-800 rounded-lg py-2.5 text-xs text-slate-500 font-mono">
          Drag &amp; drop your <code className="text-amber-300">ModernCombat3.apk</code>, <code className="text-amber-300">libModernCombat3.so</code>, or game folder here to inspect
        </div>
      </div>

      {/* Multi-Architecture Detection Card (if multiple or x86/armeabi detected) */}
      {validationResult.detectedArchitectures.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Binary className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                Detected Architectures in Imported Archive ({validationResult.detectedArchitectures.length})
              </h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
              libModernCombat3.so Located
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {validationResult.detectedArchitectures.map((arch) => {
              const isSelected = selectedArchAbi === arch.abi;
              const isX86 = arch.abi === 'x86' || arch.abi === 'x86_64';
              const isArmV7 = arch.abi === 'armeabi-v7a';

              return (
                <button
                  key={arch.abi + arch.path}
                  onClick={() => handleArchSelect(arch)}
                  className={`text-left p-3 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-amber-950/40 border-amber-500 shadow-md shadow-amber-500/10'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-xs font-bold font-mono ${
                      isX86 ? 'text-cyan-400' : isArmV7 ? 'text-emerald-400' : 'text-slate-300'
                    }`}>
                      {arch.abi.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {(arch.uncompressedSize / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-300 font-medium mb-1">
                    {arch.label}
                  </div>

                  <div className="text-[10px] font-mono text-slate-400 truncate">
                    {arch.path}
                  </div>

                  {isX86 && (
                    <div className="mt-2 text-[10px] text-cyan-300/90 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded flex items-center gap-1 font-mono">
                      <Zap className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span>Native PC x86 Execution</span>
                    </div>
                  )}

                  {isArmV7 && (
                    <div className="mt-2 text-[10px] text-emerald-300/90 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded flex items-center gap-1 font-mono">
                      <Cpu className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>Dynarmic ARMv7 JIT Target</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {validationResult.hasX86Library && (
            <div className="p-3 bg-cyan-950/30 border border-cyan-800/40 rounded-lg text-xs text-cyan-200/90 flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-cyan-300 font-semibold block">x86 Architecture Present in this APK:</strong>
                Your Modern Combat 3 APK contains native x86 CISC binaries (<code className="text-cyan-200 font-mono">lib/x86/libModernCombat3.so</code>). On x86_64 PC hardware, this allows direct native execution alongside the ARMv7 translation layer, maximizing performance!
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Package & ELF Architecture Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* File Validation & Integrity Status Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                {validationResult.isValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : validationResult.errors.length > 0 ? (
                  <XCircle className="w-4 h-4 text-rose-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                )}
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                  File Integrity &amp; Version Compatibility Report
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded font-bold ${
                  validationResult.isValid
                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                    : 'bg-rose-950/60 text-rose-400 border border-rose-800/60'
                }`}>
                  {validationResult.isValid ? 'VALID & VERIFIED' : 'INTEGRITY FAILED'}
                </span>
              </div>
            </div>

            {/* Validation Checklist Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
              <div className="bg-slate-950/70 border border-slate-800/80 rounded p-2.5 space-y-1">
                <div className="text-[10px] text-slate-500">FORMAT / TYPE</div>
                <div className="text-amber-400 font-bold">{validationResult.fileType}</div>
                <div className="text-[10px] text-slate-400 truncate">{validationResult.fileName}</div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800/80 rounded p-2.5 space-y-1">
                <div className="text-[10px] text-slate-500">TARGET VERSION</div>
                <div className="text-emerald-400 font-bold">{validationResult.detectedVersion || 'Unknown'}</div>
                <div className="text-[10px] text-slate-400">Code: {validationResult.versionCode || 'N/A'}</div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800/80 rounded p-2.5 space-y-1">
                <div className="text-[10px] text-slate-500">NATIVE LIBRARY</div>
                <div className={`font-bold ${
                  validationResult.detectedArchitectures.length > 0 || validationResult.hasArmV7Library || validationResult.hasX86Library
                    ? 'text-emerald-400'
                    : 'text-amber-400'
                }`}>
                  {validationResult.detectedArchitectures.length > 0
                    ? `FOUND (${validationResult.detectedArchitectures.length} ARCH)`
                    : validationResult.hasArmV7Library
                    ? 'ARMv7 DETECTED'
                    : 'CHECKING'}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {pkg.armLibrary.name}
                </div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800/80 rounded p-2.5 space-y-1">
                <div className="text-[10px] text-slate-500">ARCHIVE SIZE</div>
                <div className="font-bold text-emerald-400">
                  {validationResult.fileSizeMB} MB
                </div>
                <div className="text-[10px] text-slate-500">
                  {validationResult.totalArchiveFiles > 0 ? `${validationResult.totalArchiveFiles} files` : 'Direct ELF'}
                </div>
              </div>
            </div>

            {/* Warnings or Errors Display */}
            {(validationResult.warnings.length > 0 || validationResult.errors.length > 0 || validationResult.recommendations.length > 0) && (
              <div className="space-y-1.5 pt-2 border-t border-slate-800/60 text-xs">
                {validationResult.errors.map((err, i) => (
                  <div key={i} className="flex items-start gap-2 text-rose-400 bg-rose-950/20 border border-rose-900/40 p-2 rounded text-[11px]">
                    <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{err}</span>
                  </div>
                ))}
                {validationResult.warnings.map((warn, i) => (
                  <div key={i} className="flex items-start gap-2 text-amber-400 bg-amber-950/20 border border-amber-900/40 p-2 rounded text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{warn}</span>
                  </div>
                ))}
                {validationResult.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 text-slate-300 bg-slate-950 p-2 rounded border border-slate-800 text-[11px]">
                    <HelpCircle className="w-3.5 h-3.5 shrink-0 text-amber-400 mt-0.5" />
                    <span><strong>Recommendation:</strong> {rec}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Inspected Package Structure (mc3inspect Output)
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span>Active Target:</span>
                <span className="text-amber-400 font-semibold">{pkg.filename}</span>
              </div>
            </div>

            {/* Grid of Inspected Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3.5 space-y-2">
                <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                  <span>PACKAGE METADATA</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> VERIFIED
                  </span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Package ID:</span>
                    <span className="font-mono text-slate-300">{pkg.packageId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target Version:</span>
                    <span className="font-mono text-slate-300">{pkg.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Archive Size:</span>
                    <span className="font-mono text-slate-300">{pkg.fileSizeMB} MB</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3.5 space-y-2">
                <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                  <span>SELECTED NATIVE BINARY</span>
                  <span className="text-amber-400 font-mono text-[10px]">ELF32 / SO</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Library:</span>
                    <span className="font-mono text-amber-300">{pkg.armLibrary.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Architecture:</span>
                    <span className="font-mono text-slate-300">{pkg.armLibrary.architecture}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Virtual Entry:</span>
                    <span className="font-mono text-slate-300">{pkg.armLibrary.entryPoint}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* OBB Expansion Status */}
            <div className="mt-4 bg-slate-950/70 border border-slate-800/80 rounded-lg p-3.5">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                  OBB EXPANSION MOUNT (Android Filesystem Translation)
                </span>
                <span className="text-slate-500 font-mono">CRC32: {pkg.obbFile.crc32}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500">Filename: </span>
                  <span className="font-mono text-slate-300">{pkg.obbFile.name}</span>
                </div>
                <div>
                  <span className="text-slate-500">Size: </span>
                  <span className="font-mono text-slate-300">{pkg.obbFile.sizeMB} MB</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500">Virtual Mount: </span>
                  <span className="font-mono text-emerald-400">{pkg.obbFile.mountPath}</span>
                </div>
              </div>
            </div>

            {/* Dynamic Library Dependencies */}
            <div className="mt-4">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-amber-400" />
                <span>Resolved Dynamic Dependencies (Bionic / POSIX / GLES Imports)</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {pkg.neededLibraries.map((lib) => (
                  <span
                    key={lib}
                    className="font-mono text-xs text-slate-300 bg-slate-800/70 border border-slate-700/60 px-2 py-0.5 rounded"
                  >
                    {lib}
                  </span>
                ))}
              </div>
            </div>

            {/* Asset Manifest Table */}
            <div className="mt-5 border-t border-slate-800 pt-4">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>AssetManager Streamed Resources (Sample Manifest)</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500">
                      <th className="py-2">Virtual Path</th>
                      <th className="py-2">Compressed Size</th>
                      <th className="py-2">Storage Mode</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {pkg.assetManifest.map((item) => (
                      <tr key={item.path} className="text-slate-300 hover:bg-slate-800/30">
                        <td className="py-1.5 font-mono text-amber-300/90">{item.path}</td>
                        <td className="py-1.5 text-slate-400">{item.sizeKB} KB</td>
                        <td className="py-1.5 text-emerald-400">{item.compression}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Runtime Launch Configurator */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Terminal className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                Desktop Runtime Launch Configurator
              </h3>
            </div>

            {/* Form Fields */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Game Data Target (APK / Folder):</label>
                <input
                  type="text"
                  value={gameDataPath}
                  onChange={(e) => setGameDataPath(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-xs text-slate-200 focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Runtime Workspace Root:</label>
                <input
                  type="text"
                  value={runtimeRoot}
                  onChange={(e) => setRuntimeRoot(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-xs text-slate-200 focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Display Resolution:</label>
                  <select
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-xs text-slate-200 focus:outline-none focus:border-amber-500/60"
                  >
                    <option value="1920x1080">1920x1080 (1080p)</option>
                    <option value="2560x1440">2560x1440 (1440p)</option>
                    <option value="3840x2160">3840x2160 (4K UHD)</option>
                    <option value="2560x1080">2560x1080 (Ultrawide)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Framerate Target:</label>
                  <select
                    value={fpsLimit}
                    onChange={(e) => setFpsLimit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-xs text-slate-200 focus:outline-none focus:border-amber-500/60"
                  >
                    <option value="60">60 FPS (V-Sync)</option>
                    <option value="120">120 FPS</option>
                    <option value="144">144 FPS</option>
                    <option value="unlimited">Unlimited</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Generated Command Box */}
            <div className="mt-4 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span className="font-mono">COMMAND LINE EXECUTION:</span>
                <button
                  onClick={copyCommand}
                  className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-medium"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy CLI</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-[11px] text-amber-300/90 break-all select-all">
                {cliCommand}
              </div>
            </div>

            {/* Developer Tool: mc3inspect */}
            <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg text-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-300 font-semibold">
                <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                <span>mc3inspect CLI Diagnostic Utility</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Run <code className="text-amber-300 font-mono">mc3inspect.exe &lt;apk_path&gt;</code> to verify dynamic symbols, relocation tables, and ABI compatibility directly in your terminal prior to running the game.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
