import React, { useState } from 'react';
import { 
  Hammer, 
  Download, 
  Terminal, 
  Copy, 
  Check, 
  Laptop, 
  Apple, 
  Cpu, 
  Package, 
  ShieldCheck, 
  FileCode, 
  Sparkles,
  GitBranch,
  Play,
  RotateCcw,
  CheckCircle2,
  HardDrive,
  Globe,
  ExternalLink
} from 'lucide-react';

export const GameBuilderTab: React.FC = () => {
  const [targetPlatform, setTargetPlatform] = useState<'windows' | 'linux' | 'macos'>('windows');
  const [includeMods, setIncludeMods] = useState(true);
  const [resolution, setResolution] = useState('1920x1080');
  const [fpsCap, setFpsCap] = useState('120');
  const [activeWorkflow, setActiveWorkflow] = useState<'pages' | 'ci'>('pages');
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedWorkflow, setCopiedWorkflow] = useState(false);
  const [building, setBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState<number>(0);
  const [buildStep, setBuildStep] = useState<string>('');
  const [packageReady, setPackageReady] = useState(false);

  const startPackaging = () => {
    setBuilding(true);
    setPackageReady(false);
    setBuildProgress(15);
    setBuildStep('Validating user APK archive & inspecting ARMv7 ELF library...');

    setTimeout(() => {
      setBuildProgress(45);
      setBuildStep('Materializing libModernCombat3.so into runtime cache directory...');
    }, 800);

    setTimeout(() => {
      setBuildProgress(75);
      setBuildStep('Generating standalone mc3.ini & mounting custom community mods...');
    }, 1600);

    setTimeout(() => {
      setBuildProgress(100);
      setBuildStep('Packaging standalone desktop executable & asset pipeline!');
      setBuilding(false);
      setPackageReady(true);
    }, 2400);
  };

  const copyScript = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const copyWorkflow = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedWorkflow(true);
    setTimeout(() => setCopiedWorkflow(false), 2000);
  };

  const standaloneScripts = {
    windows: `@echo off
REM ========================================================
REM MC3 Standalone Desktop Game Builder (Windows CLI)
REM Run this locally on your PC without visiting the website!
REM ========================================================

mc3builder.exe --apk "Modern-Combat-3-Fallen-Nation-v1-1-7g.apk" ^
               --obb "main.1170.com.gameloft.android.ANMP.GloftM3HM.obb" ^
               --out "./ModernCombat3_PC_Release" ^
               --platform windows ^
               --widescreen

echo [SUCCESS] Standalone game created in ./ModernCombat3_PC_Release!
echo Double-click mc3.exe to play.`,

    linux: `#!/usr/bin/env bash
# ========================================================
# MC3 Standalone Desktop Game Builder (Linux CLI)
# Run this locally on your PC without visiting the website!
# ========================================================
set -e

./mc3builder --apk "Modern-Combat-3-Fallen-Nation-v1-1-7g.apk" \\
             --obb "main.1170.com.gameloft.android.ANMP.GloftM3HM.obb" \\
             --out "./ModernCombat3_Linux_Release" \\
             --platform linux \\
             --widescreen

echo "[SUCCESS] Standalone game created in ./ModernCombat3_Linux_Release!"
echo "Run: cd ModernCombat3_Linux_Release && ./mc3"`,

    macos: `#!/usr/bin/env bash
# ========================================================
# MC3 Standalone Desktop Game Builder (macOS CLI)
# Run this locally on your Mac without visiting the website!
# ========================================================
set -e

./mc3builder --apk "Modern-Combat-3-Fallen-Nation-v1-1-7g.apk" \\
             --obb "main.1170.com.gameloft.android.ANMP.GloftM3HM.obb" \\
             --out "./ModernCombat3_Mac_Release" \\
             --platform macos \\
             --widescreen

echo "[SUCCESS] Standalone game created in ./ModernCombat3_Mac_Release!"
echo "Run: open ./ModernCombat3_Mac_Release/mc3"`,
  };

  const githubPagesYaml = `name: Deploy Web Portal to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    name: Build Web App
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Setup Node.js Environment
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Node Dependencies
        run: npm ci || npm install

      - name: Build Web Application
        run: npm run build

      - name: Configure GitHub Pages
        uses: actions/configure-pages@v5

      - name: Upload Pages Artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    name: Deploy to GitHub Pages
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4`;

  const githubActionsYaml = `name: Multi-Platform CI & Release Packaging

on:
  push:
    branches: [ main ]
    tags: [ 'v*' ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    name: Build \${{ matrix.os }}
    runs-on: \${{ matrix.os }}
    strategy:
      fail-fast: false
      matrix:
        include:
          - os: windows-latest
            archive: mc3-windows-x64.zip
          - os: ubuntu-latest
            archive: mc3-linux-x64.tar.gz
          - os: macos-latest
            archive: mc3-macos-universal.zip

    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Setup Linux Dependencies
        if: runner.os == 'Linux'
        run: |
          sudo apt-get update
          sudo apt-get install -y cmake ninja-build g++ libboost-all-dev libsdl3-dev

      - name: Setup macOS Dependencies
        if: runner.os == 'macOS'
        run: brew install cmake ninja boost sdl3

      - name: Configure CMake
        run: |
          cmake -B build -DMC3_ENABLE_DYNARMIC=ON -DMC3_ENABLE_TOOLS=ON -DMC3_ENABLE_TESTS=ON

      - name: Compile mc3, mc3inspect & mc3builder
        run: cmake --build build --config Release --parallel 2

      - name: Run Test Suite
        run: ctest --test-dir build -C Release --output-on-failure

      - name: Upload Binaries Artifact
        uses: actions/upload-artifact@v4
        with:
          name: \${{ matrix.os }}-release-bundle
          path: build/bin/Release/*`;

  return (
    <div className="space-y-6">
      {/* Top Banner: Standalone Offline Builder Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 mt-1">
              <Hammer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-sans">
                Standalone Desktop Game Builder &amp; GitHub Actions CI/CD
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                You never have to rely on a web browser! Download the standalone <span className="text-amber-400 font-mono">mc3builder</span> tool directly for Windows, Linux, or macOS. It extracts your APK/OBB, sets up native configuration, and packages a ready-to-play offline desktop bundle. Automated multi-platform builds are pre-configured for GitHub Actions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% OFFLINE DESKTOP EXECUTION
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6 Columns: Interactive Standalone Game Packager Simulator */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                  Desktop Game Package Builder (Simulated)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-500">mc3builder CLI Engine</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Target Desktop Platform:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setTargetPlatform('windows')}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-lg border font-mono text-xs transition-colors ${
                      targetPlatform === 'windows'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <Laptop className="w-3.5 h-3.5" />
                    <span>Windows (x64)</span>
                  </button>

                  <button
                    onClick={() => setTargetPlatform('linux')}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-lg border font-mono text-xs transition-colors ${
                      targetPlatform === 'linux'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Linux</span>
                  </button>

                  <button
                    onClick={() => setTargetPlatform('macos')}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-lg border font-mono text-xs transition-colors ${
                      targetPlatform === 'macos'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <Apple className="w-3.5 h-3.5" />
                    <span>macOS</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Target Resolution:</label>
                  <select
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-xs text-slate-200"
                  >
                    <option value="1920x1080">1920x1080 (1080p 16:9)</option>
                    <option value="2560x1440">2560x1440 (1440p 16:9)</option>
                    <option value="3840x2160">3840x2160 (4K UHD)</option>
                    <option value="2560x1080">2560x1080 (Ultrawide 21:9)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Framerate Cap:</label>
                  <select
                    value={fpsCap}
                    onChange={(e) => setFpsCap(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-xs text-slate-200"
                  >
                    <option value="60">60 FPS</option>
                    <option value="120">120 FPS</option>
                    <option value="144">144 FPS</option>
                    <option value="unlimited">Unlimited (Unlock)</option>
                  </select>
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-mono text-xs">
                  <input
                    type="checkbox"
                    checked={includeMods}
                    onChange={(e) => setIncludeMods(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0"
                  />
                  <span>Bundle Active Community Mods (Weapons &amp; Maps) into Standalone Package</span>
                </label>
              </div>
            </div>

            {/* Build Progress Stepper */}
            {building && (
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-amber-400 font-semibold">{buildStep}</span>
                  <span className="text-slate-400">{buildProgress}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full transition-all duration-300 ease-out"
                    style={{ width: `${buildProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Package Ready Notification */}
            {packageReady && (
              <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-lg p-3.5 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold font-mono">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Standalone Game Bundle Generated Successfully!</span>
                </div>
                <div className="font-mono text-slate-300 text-[11px] space-y-1">
                  <div>Folder: <span className="text-amber-300">./MC3_{targetPlatform.toUpperCase()}_Game/</span></div>
                  <div>Executable: <span className="text-emerald-400">{targetPlatform === 'windows' ? 'mc3.exe' : './mc3'}</span></div>
                  <div>Config: <span className="text-slate-400">mc3.ini (Widescreen {resolution}, {fpsCap} FPS)</span></div>
                  <div>Mods: <span className="text-slate-400">{includeMods ? 'Enabled (mods/ folder bundled)' : 'Vanilla Base'}</span></div>
                </div>
              </div>
            )}

            {/* Packaging Action Buttons */}
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={startPackaging}
                disabled={building}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{building ? 'Packaging Standalone Game...' : 'Generate Standalone Bundle'}</span>
              </button>

              <button
                onClick={() => {
                  setPackageReady(false);
                  setBuildProgress(0);
                  setBuildStep('');
                }}
                className="p-2 text-xs text-slate-400 hover:text-slate-200 bg-slate-800 rounded-lg border border-slate-700"
                title="Reset Builder"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Downloadable CLI Script Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                  Downloadable Script for {targetPlatform.toUpperCase()}
                </h3>
              </div>
              <button
                onClick={() => copyScript(standaloneScripts[targetPlatform])}
                className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-mono"
              >
                {copiedScript ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedScript ? 'Copied Script!' : 'Copy Script'}</span>
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-[11px] text-amber-300/90 whitespace-pre-wrap overflow-x-auto select-all">
              {standaloneScripts[targetPlatform]}
            </div>
          </div>
        </div>

        {/* Right 6 Columns: GitHub Actions CI/CD Pipeline & GitHub Pages Deployment */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                  GitHub Actions Workflows
                </h3>
              </div>

              {/* Workflow Selector Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => setActiveWorkflow('pages')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                    activeWorkflow === 'pages'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Globe className="w-3 h-3 text-emerald-400" />
                  <span>GitHub Pages</span>
                </button>

                <button
                  onClick={() => setActiveWorkflow('ci')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                    activeWorkflow === 'ci'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Cpu className="w-3 h-3 text-amber-400" />
                  <span>Native CI Matrix</span>
                </button>
              </div>
            </div>

            {/* Workflow Header & Actions */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">
                File: <span className="text-amber-400">
                  {activeWorkflow === 'pages' ? '.github/workflows/deploy-pages.yml' : '.github/workflows/build-all.yml'}
                </span>
              </span>

              <button
                onClick={() => copyWorkflow(activeWorkflow === 'pages' ? githubPagesYaml : githubActionsYaml)}
                className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-mono"
              >
                {copiedWorkflow ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedWorkflow ? 'Copied YAML!' : `Copy ${activeWorkflow === 'pages' ? 'deploy-pages.yml' : 'build-all.yml'}`}</span>
              </button>
            </div>

            {activeWorkflow === 'pages' ? (
              <div className="space-y-3">
                <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-slate-200 font-medium">GitHub Pages Live URL:</span>{' '}
                      <a
                        href="https://yoimdoingstuff.github.io/mc3ported/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 underline hover:text-emerald-300 font-mono"
                      >
                        https://yoimdoingstuff.github.io/mc3ported/
                      </a>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded shrink-0">
                    SPA RELATIVE BASE ENABLED
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <p className="text-slate-400 leading-relaxed">
                    This workflow automatically compiles the Vite web portal, generates SPA fallback pages and <code className="text-slate-300 font-mono">.nojekyll</code>, and deploys directly to GitHub Pages on every push to <span className="text-amber-300 font-mono">main</span>.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-[11px] text-slate-300 whitespace-pre-wrap overflow-x-auto max-h-[340px] overflow-y-auto select-all">
                  {githubPagesYaml}
                </div>

                <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 text-xs space-y-1.5">
                  <div className="font-semibold text-slate-200 font-mono flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>How to Enable GitHub Pages in your Repository:</span>
                  </div>
                  <ol className="list-decimal list-inside text-[11px] text-slate-400 space-y-1">
                    <li>Open repository on GitHub (<strong className="text-slate-300">yoimdoingstuff/mc3ported</strong>)</li>
                    <li>Navigate to <strong className="text-slate-300">Settings</strong> &gt; <strong className="text-slate-300">Pages</strong></li>
                    <li>Under <strong className="text-slate-300">Build and deployment &gt; Source</strong>, select <strong className="text-amber-300 font-mono">GitHub Actions</strong></li>
                    <li>Commit/push to <code className="text-amber-300">main</code> or trigger manually in <strong className="text-slate-300">Actions</strong> tab</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2 text-xs">
                  <p className="text-slate-400 leading-relaxed">
                    When you push this repository to GitHub, the workflow below automatically compiles native release packages for <span className="text-slate-200 font-mono">Windows</span>, <span className="text-slate-200 font-mono">Linux</span>, and <span className="text-slate-200 font-mono">macOS</span> simultaneously using GitHub Actions matrix workers.
                  </p>

                  <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                    <div className="bg-slate-950 border border-slate-800 rounded p-2 text-center">
                      <div className="text-amber-400 font-bold">windows-latest</div>
                      <div className="text-slate-500 text-[10px]">MSVC 2022 (x64)</div>
                    </div>
                    <div className="bg-slate-950 border border-slate-800 rounded p-2 text-center">
                      <div className="text-emerald-400 font-bold">ubuntu-latest</div>
                      <div className="text-slate-500 text-[10px]">GCC / Ninja</div>
                    </div>
                    <div className="bg-slate-950 border border-slate-800 rounded p-2 text-center">
                      <div className="text-blue-400 font-bold">macos-latest</div>
                      <div className="text-slate-500 text-[10px]">Apple Clang</div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-[11px] text-slate-300 whitespace-pre-wrap overflow-x-auto max-h-[340px] overflow-y-auto select-all">
                  {githubActionsYaml}
                </div>

                <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 text-xs space-y-1">
                  <div className="font-semibold text-slate-200 font-mono">How to Download Pre-Built Binaries from GitHub:</div>
                  <ol className="list-decimal list-inside text-[11px] text-slate-400 space-y-1">
                    <li>Push commits or push a version tag (e.g., <code className="text-amber-300">git tag v0.1.0 && git push --tags</code>)</li>
                    <li>Navigate to the <strong className="text-slate-300">Actions</strong> tab in your repository</li>
                    <li>Select the completed workflow run and download the zipped release artifacts</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
