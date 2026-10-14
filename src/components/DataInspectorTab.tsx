import React, { useState } from 'react';
import { DEFAULT_PACKAGE } from '../data/mc3Data';
import { validateApkOrObbFile, validateFilenameAndSize, FileValidationResult } from '../utils/fileValidation';
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
  HelpCircle
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

  const cliCommand = `mc3.exe --game-data "${gameDataPath}" --runtime-root "${runtimeRoot}" --resolution ${resolution} --fps-limit ${fpsLimit}`;

  const copyCommand = () => {
    navigator.clipboard.writeText(cliCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsValidating(true);
      setActivePreset('custom');
      setGameDataPath(`C:\\Games\\MC3\\${file.name}`);
      
      const result = await validateApkOrObbFile(file);
      setValidationResult(result);
      setIsValidating(false);

      setPkg({
        ...DEFAULT_PACKAGE,
        filename: file.name,
        fileSizeMB: result.fileSizeMB,
        version: result.detectedVersion ? `Detected ${result.detectedVersion}` : 'User Provided Archive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: User-Supplied Asset Architecture */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 mt-1">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-sans">
                User-Supplied Game Data Pipeline (Zero Redistributed Assets)
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                In strict compliance with repository legal boundaries, <span className="text-slate-200 font-mono">mc3ported</span> contains only the compatibility runtime and translation layer. Proprietary game assets (APK and OBB) are supplied directly by the user. On launch, only <span className="text-amber-400 font-mono">libModernCombat3.so</span> is materialized into the runtime cache, keeping overhead below 50 MB.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="cursor-pointer flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors">
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span>Select Custom APK/OBB</span>
              <input type="file" accept=".apk,.zip,.obb" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>
      </div>

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
                  validationResult.isValid && validationResult.sizeValidation === 'PASS'
                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                    : validationResult.isValid
                    ? 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
                    : 'bg-rose-950/60 text-rose-400 border border-rose-800/60'
                }`}>
                  {validationResult.isValid ? (validationResult.isRetailV117g ? 'VERIFIED v1.1.7g RETAIL' : 'VALID COMPATIBLE') : 'INTEGRITY FAILED'}
                </span>
              </div>
            </div>

            {/* Validation Checklist Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
              <div className="bg-slate-950/70 border border-slate-800/80 rounded p-2.5 space-y-1">
                <div className="text-[10px] text-slate-500">FORMAT / TYPE</div>
                <div className="text-amber-400 font-bold">{validationResult.fileType}</div>
                <div className="text-[10px] text-slate-400">{validationResult.fileName}</div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800/80 rounded p-2.5 space-y-1">
                <div className="text-[10px] text-slate-500">TARGET VERSION</div>
                <div className="text-emerald-400 font-bold">{validationResult.detectedVersion || 'Unknown'}</div>
                <div className="text-[10px] text-slate-400">Code: {validationResult.versionCode || 'N/A'}</div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800/80 rounded p-2.5 space-y-1">
                <div className="text-[10px] text-slate-500">ZIP MAGIC BYTES</div>
                <div className={`font-bold ${
                  validationResult.headerValidation === 'FAIL'
                    ? 'text-rose-400'
                    : validationResult.headerValidation === 'PASS'
                    ? 'text-emerald-400'
                    : 'text-slate-400'
                }`}>
                  {validationResult.headerValidation === 'PASS' ? 'PASS (PK\\x03\\x04)' : validationResult.headerValidation === 'FAIL' ? 'FAIL' : 'SKIPPED (Static)'}
                </div>
                <div className="text-[10px] text-slate-500">Header Checked</div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800/80 rounded p-2.5 space-y-1">
                <div className="text-[10px] text-slate-500">SIZE HEURISTICS</div>
                <div className={`font-bold ${
                  validationResult.sizeValidation === 'PASS'
                    ? 'text-emerald-400'
                    : validationResult.sizeValidation === 'WARNING'
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}>
                  {validationResult.sizeValidation} ({validationResult.fileSizeMB} MB)
                </div>
                <div className="text-[10px] text-slate-500">Expected: 14.8 MB</div>
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
                <span>Preset:</span>
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
                  <span>ARMv7 NATIVE BINARY</span>
                  <span className="text-amber-400 font-mono text-[10px]">ELF32</span>
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
                    <span className="text-slate-500">Entry Point:</span>
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

        {/* Right Column: Interactive CLI Launcher Builder */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Terminal className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Launcher CLI Parameters Generator
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Game Data Path (--game-data):</label>
                <input
                  type="text"
                  value={gameDataPath}
                  onChange={(e) => setGameDataPath(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-xs text-slate-200 focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Runtime Root Cache (--runtime-root):</label>
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
