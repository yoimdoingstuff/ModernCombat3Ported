import React, { useState } from 'react';
import { DEFAULT_MODS } from '../data/mc3Data';
import { ModItem, WeaponModItem, MapModItem } from '../types/mc3';
import { 
  Puzzle, 
  Crosshair, 
  Map, 
  Upload, 
  ShieldCheck, 
  AlertTriangle, 
  Download, 
  Plus, 
  Trash2, 
  Sliders, 
  Sparkles, 
  Check, 
  Copy,
  Layers,
  FolderArchive,
  Volume2,
  Image,
  RefreshCw
} from 'lucide-react';

export const ModManagementTab: React.FC = () => {
  const [mods, setMods] = useState<ModItem[]>(DEFAULT_MODS);
  const [selectedModId, setSelectedModId] = useState<string>(DEFAULT_MODS[0].id);
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Weapon' | 'Map' | 'Texture' | 'Audio'>('All');
  const [copied, setCopied] = useState(false);
  const [showAddWeaponModal, setShowAddWeaponModal] = useState(false);

  // New Weapon State
  const [newWeaponName, setNewWeaponName] = useState('AK-12 Tactical Assault Rifle');
  const [newWeaponBase, setNewWeaponBase] = useState('Brava-18');
  const [newWeaponDamage, setNewWeaponDamage] = useState(42);
  const [newWeaponRpm, setNewWeaponRpm] = useState(650);
  const [newWeaponMag, setNewWeaponMag] = useState(30);

  const selectedMod = mods.find((m) => m.id === selectedModId) || mods[0];

  const filteredMods = mods.filter((m) => {
    if (categoryFilter === 'All') return true;
    return m.category === categoryFilter;
  });

  const toggleMod = (id: string) => {
    setMods((prev) =>
      prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m))
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isMap = file.name.toLowerCase().includes('map');
      const newMod: ModItem = {
        id: `user_mod_${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        author: 'User / Community',
        version: '1.0.0',
        description: 'Imported community modification package from ' + file.name,
        category: isMap ? 'Map' : 'Weapon',
        enabled: true,
        vanillaSafe: false,
        sizeMB: +(file.size / (1024 * 1024)).toFixed(1) || 12.5,
        weapons: isMap ? undefined : [
          {
            id: `custom_gun_${Date.now()}`,
            name: 'Imported Custom Weapon',
            baseWeapon: 'Brava-18',
            damage: 40,
            fireRateRpm: 600,
            magazineSize: 30,
            recoil: 1.0,
            modelFile: 'mods/user/models/gun.3d',
            soundFile: 'mods/user/audio/fire.wav',
            vanillaSafe: false,
          }
        ],
        maps: isMap ? [
          {
            id: `custom_map_${Date.now()}`,
            name: file.name.replace(/\.[^/.]+$/, ''),
            mapFile: `mods/user/maps/${file.name}`,
            environment: 'Custom Arena',
            maxPlayers: 12,
            supportedModes: ['Team Deathmatch', 'Free For All'],
            thumbnail: 'custom_thumb',
            vanillaSafe: false,
          }
        ] : undefined,
      };
      setMods((prev) => [newMod, ...prev]);
      setSelectedModId(newMod.id);
    }
  };

  const handleCreateCustomWeapon = () => {
    const customGun: WeaponModItem = {
      id: `gun_custom_${Date.now()}`,
      name: newWeaponName,
      baseWeapon: newWeaponBase,
      damage: newWeaponDamage,
      fireRateRpm: newWeaponRpm,
      magazineSize: newWeaponMag,
      recoil: 1.2,
      modelFile: `mods/custom/models/${newWeaponName.toLowerCase().replace(/\s+/g, '_')}.3d`,
      soundFile: `mods/custom/audio/${newWeaponName.toLowerCase().replace(/\s+/g, '_')}.wav`,
      vanillaSafe: false,
    };

    setMods((prev) =>
      prev.map((m) => {
        if (m.id === selectedMod.id) {
          return {
            ...m,
            weapons: [...(m.weapons || []), customGun],
          };
        }
        return m;
      })
    );
    setShowAddWeaponModal(false);
  };

  const activeWeaponsCount = mods
    .filter((m) => m.enabled)
    .reduce((acc, m) => acc + (m.weapons?.length || 0), 0);

  const activeMapsCount = mods
    .filter((m) => m.enabled)
    .reduce((acc, m) => acc + (m.maps?.length || 0), 0);

  const isVanillaCompatible = mods.every((m) => !m.enabled || m.vanillaSafe);

  const exportModsConfig = () => {
    const config = JSON.stringify(
      {
        mc3_mod_config_version: '1.0',
        active_mods: mods.filter((m) => m.enabled).map((m) => ({
          id: m.id,
          title: m.title,
          category: m.category,
          vanilla_safe: m.vanillaSafe,
        })),
        network_mode: isVanillaCompatible ? 'VANILLA_NETPLAY' : 'MODDED_LOBBY',
      },
      null,
      2
    );
    navigator.clipboard.writeText(config);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Mod Architecture & Netplay Compatibility Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 mt-1">
              <Puzzle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-sans">
                  Community Mod Management &amp; Asset Interception
                </h2>
                {isVanillaCompatible ? (
                  <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                    <ShieldCheck className="w-3 h-3" />
                    VANILLA NETPLAY (iOS &amp; Android Compatible)
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-mono text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
                    <AlertTriangle className="w-3 h-3" />
                    MODDED LOBBY ACTIVE (Custom Weapons / Maps)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                Import custom maps, high-powered weapon packs, and HD texture remasters. The translation layer routes file requests through <span className="text-slate-200 font-mono">ModManager</span>. Base game multiplayer stays 100% compatible with unmodified iOS and Android peers when using default or cosmetic mods.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="cursor-pointer flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors">
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span>Import Mod (.zip / .mc3mod)</span>
              <input type="file" accept=".zip,.mc3mod,.mc3map,.mc3gun" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={exportModsConfig}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 text-white transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Config!' : 'Export mods.json'}</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Counter */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800/80 text-xs font-mono">
          <div className="bg-slate-950/70 border border-slate-800/80 rounded p-2 flex justify-between items-center">
            <span className="text-slate-400">Total Installed Mods:</span>
            <span className="text-slate-200 font-bold">{mods.length}</span>
          </div>
          <div className="bg-slate-950/70 border border-slate-800/80 rounded p-2 flex justify-between items-center">
            <span className="text-slate-400">Active Custom Weapons:</span>
            <span className="text-amber-400 font-bold">{activeWeaponsCount}</span>
          </div>
          <div className="bg-slate-950/70 border border-slate-800/80 rounded p-2 flex justify-between items-center">
            <span className="text-slate-400">Active Custom Maps:</span>
            <span className="text-emerald-400 font-bold">{activeMapsCount}</span>
          </div>
          <div className="bg-slate-950/70 border border-slate-800/80 rounded p-2 flex justify-between items-center">
            <span className="text-slate-400">Netplay Protocol:</span>
            <span className={isVanillaCompatible ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
              {isVanillaCompatible ? 'Vanilla v1.1.7g' : 'Modded Custom'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Mod List & Selected Mod Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Columns: Mod Packages List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                Installed Community Mods
              </h3>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1">
                {(['All', 'Weapon', 'Map', 'Texture', 'Audio'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
                      categoryFilter === cat
                        ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {filteredMods.map((mod) => {
                const isSelected = mod.id === selectedModId;
                return (
                  <div
                    key={mod.id}
                    onClick={() => setSelectedModId(mod.id)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-850 border-amber-500/60 bg-slate-800/60 shadow-md'
                        : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-800/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-slate-100">{mod.title}</span>
                          <span className="text-[10px] font-mono text-slate-500">v{mod.version}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                          <span className="text-amber-400/90 font-medium">{mod.category}</span>
                          <span>·</span>
                          <span>{mod.author}</span>
                          <span>·</span>
                          <span>{mod.sizeMB} MB</span>
                        </div>
                      </div>

                      {/* Toggle Active Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMod(mod.id);
                        }}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          mod.enabled ? 'bg-emerald-500' : 'bg-slate-700'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                            mod.enabled ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Multiplayer Compatibility Kicker */}
                    <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-500">Netplay:</span>
                      {mod.vanillaSafe ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Vanilla Safe
                        </span>
                      ) : (
                        <span className="text-amber-400 font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Modded Server Required
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 7 Columns: Active Mod Inspector & Weapon/Map Customizer */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-5">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
                    {selectedMod.title}
                  </h3>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                    selectedMod.enabled
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}>
                    {selectedMod.enabled ? 'ENABLED' : 'DISABLED'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{selectedMod.description}</p>
              </div>

              {selectedMod.category === 'Weapon' && (
                <button
                  onClick={() => setShowAddWeaponModal(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 text-white transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Weapon</span>
                </button>
              )}
            </div>

            {/* If Weapon Mod: Show Weapons Arsenal */}
            {selectedMod.weapons && selectedMod.weapons.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                  <Crosshair className="w-4 h-4 text-amber-400" />
                  <span>Bundled Custom Weapons ({selectedMod.weapons.length})</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedMod.weapons.map((gun) => (
                    <div
                      key={gun.id}
                      className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-3.5 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold text-xs text-amber-300 font-mono">{gun.name}</div>
                          <div className="text-[10px] font-mono text-slate-500">
                            Replaces: {gun.baseWeapon}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                          {gun.magazineSize} Rds
                        </span>
                      </div>

                      {/* Weapon Ballistics Bars */}
                      <div className="space-y-1.5 text-[11px] font-mono">
                        <div>
                          <div className="flex justify-between text-slate-400">
                            <span>Damage:</span>
                            <span className="text-slate-200 font-semibold">{gun.damage} HP</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-0.5">
                            <div
                              className="bg-rose-500 h-full rounded-full"
                              style={{ width: `${Math.min(100, (gun.damage / 100) * 100)}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-slate-400">
                            <span>Fire Rate:</span>
                            <span className="text-slate-200 font-semibold">{gun.fireRateRpm} RPM</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-0.5">
                            <div
                              className="bg-amber-500 h-full rounded-full"
                              style={{ width: `${Math.min(100, (gun.fireRateRpm / 900) * 100)}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-slate-400">
                            <span>Recoil Stability:</span>
                            <span className="text-slate-200 font-semibold">{gun.recoil}x</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-0.5">
                            <div
                              className="bg-emerald-500 h-full rounded-full"
                              style={{ width: `${Math.max(10, 100 - gun.recoil * 18)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800/60 text-[10px] font-mono text-slate-500 truncate">
                        Asset: <span className="text-slate-400">{gun.modelFile}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* If Map Mod: Show Custom Map Details */}
            {selectedMod.maps && selectedMod.maps.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                  <Map className="w-4 h-4 text-emerald-400" />
                  <span>Custom Community Maps ({selectedMod.maps.length})</span>
                </div>

                <div className="space-y-3">
                  {selectedMod.maps.map((map) => (
                    <div
                      key={map.id}
                      className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-4 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-sm text-emerald-400 font-mono">{map.name}</h4>
                          <span className="text-xs text-slate-400">Setting: {map.environment}</span>
                        </div>
                        <span className="text-xs font-mono text-amber-300 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded self-start">
                          Max: {map.maxPlayers} Players
                        </span>
                      </div>

                      <div>
                        <span className="text-xs text-slate-500 font-mono">Supported Game Modes:</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {map.supportedModes.map((mode) => (
                            <span
                              key={mode}
                              className="text-[11px] font-mono text-slate-300 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded"
                            >
                              {mode}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-800/60">
                        Binary Map File: <span className="text-slate-300">{map.mapFile}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mod Asset Intercept Details */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 text-xs space-y-1.5">
              <div className="text-slate-300 font-semibold font-mono flex items-center gap-1.5">
                <FolderArchive className="w-3.5 h-3.5 text-amber-400" />
                <span>Runtime Asset Interception Route</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                When active, <code className="text-amber-300 font-mono">AAssetManager_open()</code> calls inside <code className="text-slate-300 font-mono">libModernCombat3.so</code> are checked against this mod's override table before reading default assets from the APK/OBB archives.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Add Custom Weapon */}
      {showAddWeaponModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                Create Custom Weapon Definition
              </h3>
              <button
                onClick={() => setShowAddWeaponModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Weapon Name:</label>
                <input
                  type="text"
                  value={newWeaponName}
                  onChange={(e) => setNewWeaponName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-xs text-slate-200 focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Base Replacement Model:</label>
                <select
                  value={newWeaponBase}
                  onChange={(e) => setNewWeaponBase(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-xs text-slate-200 focus:outline-none focus:border-amber-500/60"
                >
                  <option value="Brava-18">Brava-18 Assault Rifle</option>
                  <option value="MC-4">MC-4 Tactical Submachine Gun</option>
                  <option value="Bravel-1">Bravel-1 Combat Shotgun</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Damage (HP):</label>
                  <input
                    type="number"
                    value={newWeaponDamage}
                    onChange={(e) => setNewWeaponDamage(+e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 font-mono text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Rate (RPM):</label>
                  <input
                    type="number"
                    value={newWeaponRpm}
                    onChange={(e) => setNewWeaponRpm(+e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 font-mono text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Mag Size:</label>
                  <input
                    type="number"
                    value={newWeaponMag}
                    onChange={(e) => setNewWeaponMag(+e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 font-mono text-xs text-slate-200"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowAddWeaponModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCustomWeapon}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                Inject Custom Weapon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
