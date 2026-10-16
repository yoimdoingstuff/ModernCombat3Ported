import React, { useState } from 'react';
import { Header } from './components/Header';
import { RuntimeSimulatorTab } from './components/RuntimeSimulatorTab';
import { DataInspectorTab } from './components/DataInspectorTab';
import { ArmTranslationTab } from './components/ArmTranslationTab';
import { PcFeaturesTab } from './components/PcFeaturesTab';
import { MultiplayerTab } from './components/MultiplayerTab';
import { ModManagementTab } from './components/ModManagementTab';
import { GameBuilderTab } from './components/GameBuilderTab';
import { NativeBuildTab } from './components/NativeBuildTab';
import { ArchitectureTab } from './components/ArchitectureTab';
import { ActiveTab } from './types/mc3';
import { ShieldCheck, Github, ExternalLink, Terminal, HardDrive, Globe } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('launcher');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {activeTab === 'launcher' && <RuntimeSimulatorTab />}
        {activeTab === 'inspector' && <DataInspectorTab />}
        {activeTab === 'arm_runtime' && <ArmTranslationTab />}
        {activeTab === 'pc_features' && <PcFeaturesTab />}
        {activeTab === 'multiplayer' && <MultiplayerTab />}
        {activeTab === 'mods' && <ModManagementTab />}
        {activeTab === 'builder' && <GameBuilderTab />}
        {activeTab === 'builds' && <NativeBuildTab />}
        {activeTab === 'architecture' && <ArchitectureTab />}
      </main>

      <footer className="border-t border-slate-800/80 bg-slate-950/90 py-5 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-slate-400 font-semibold">MC3 Ported Project</span>
            <span className="text-slate-700">·</span>
            <span>Modern Combat 3: Fallen Nation Compatibility Runtime</span>
            <span className="text-slate-700">·</span>
            <span className="text-amber-400 font-mono">Targets: Windows · macOS · Linux · Xbox 360</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://yoimdoingstuff.github.io/mc3ported/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors font-mono"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>GitHub Pages</span>
              <ExternalLink className="w-3 h-3 text-emerald-600" />
            </a>

            <span className="text-slate-700">·</span>

            <a
              href="https://github.com/yoimdoingstuff/mc3ported"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors font-mono"
            >
              <Github className="w-3.5 h-3.5" />
              <span>yoimdoingstuff/mc3ported</span>
              <ExternalLink className="w-3 h-3 text-slate-600" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
