import React from 'react';
import { Upload, ArrowRight, Play, Eye, Layers } from 'lucide-react';
import { PRESET_ARTWORKS } from '../data/presets';
import { PresetArtwork, AppPhase } from '../types';

interface HomePageProps {
  onSelectPreset: (preset: PresetArtwork) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResumeStudio?: () => void;
  hasActiveArtwork: boolean;
  activePresetTitle?: string;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSelectPreset,
  onFileUpload,
  onResumeStudio,
  hasActiveArtwork,
  activePresetTitle,
}) => {
  return (
    <div className="flex-1 overflow-y-auto bg-[#0e0e10] text-[#f0f0f2] p-4 sm:p-8 lg:p-12">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header Hero */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-mono uppercase tracking-widest text-indigo-400">Visual Deconstruction Studio</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif tracking-tight text-white">
              Master the Art of Seeing
            </h1>
            <p className="text-sm sm:text-base text-white/60 max-w-2xl mt-2 leading-relaxed">
              Deconstruct classical masterpieces into fundamental learning layers: structural geometry, contour lines, flat tonal planes, and surface nuance.
            </p>
          </div>

          {hasActiveArtwork && onResumeStudio && (
            <button
              onClick={onResumeStudio}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all self-start md:self-auto cursor-pointer"
            >
              <Play size={14} />
              <span>Resume Studio ({activePresetTitle || 'Current Artwork'})</span>
            </button>
          )}
        </div>

        {/* Masterpieces Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Masterpiece Presets</h2>
              <p className="text-xs text-white/50">Select any famous artwork to immediately start layer analysis</p>
            </div>
            <span className="text-xs font-mono text-white/40">{PRESET_ARTWORKS.length} Masterpieces</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PRESET_ARTWORKS.map((preset) => (
              <div
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                className="group flex flex-col rounded-2xl overflow-hidden border border-white/10 bg-[#141418] hover:border-indigo-500/50 hover:bg-[#1a1a22] transition-all duration-300 cursor-pointer shadow-lg hover:shadow-indigo-500/10 flex-shrink-0"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/60">
                  <img
                    src={preset.src}
                    alt={preset.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141418] via-transparent to-transparent opacity-90" />
                  
                  <div className="absolute top-3 left-3">
                    <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-black/70 text-indigo-300 backdrop-blur-md border border-white/10">
                      {preset.period}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-baseline justify-between text-white">
                    <div>
                      <h3 className="text-base font-semibold group-hover:text-indigo-300 transition-colors">
                        {preset.title}
                      </h3>
                      <p className="text-xs text-white/60">
                        {preset.artist} • {preset.year}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 flex flex-col flex-1 justify-between gap-3 bg-[#141418]">
                  <p className="text-xs text-white/70 leading-relaxed">
                    {preset.description}
                  </p>

                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-[11px] text-white/60">
                    <span className="text-indigo-400 font-medium">Study Focus: </span>
                    {preset.focusTip}
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
                    <span>Open in Drawing Studio</span>
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            ))}

            {/* Merged Upload Card inside Grid */}
            <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.02] hover:bg-white/[0.05] hover:border-indigo-500/50 transition-all p-8 text-center cursor-pointer group min-h-[340px]">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload size={24} />
              </div>
              <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors">
                Upload Custom Image
              </h3>
              <p className="text-xs text-white/50 max-w-xs mt-1.5 leading-relaxed">
                Analyze any portrait, figure reference, or landscape from your computer.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 group-hover:bg-indigo-600 text-white text-xs font-medium transition-colors">
                <span>Browse Files (PNG, JPG)</span>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={onFileUpload}
              />
            </label>
          </div>
        </div>

        {/* Learning Layers Guide */}
        <div className="pt-8 border-t border-white/10">
          <h2 className="text-base font-semibold text-white mb-3">Deconstruction Pipeline</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <PhaseOverview title="Geometry" phase={AppPhase.GEOMETRY} desc="Faded key reference to sketch core gesture & perspective" />
            <PhaseOverview title="Blueprint" phase={AppPhase.BLUEPRINT} desc="Simplified contour boundary map for structural tracing" />
            <PhaseOverview title="Contours" phase={AppPhase.CONTOURS} desc="Mathematical Sobel & Laplacian edge extraction" />
            <PhaseOverview title="Flat Values" phase={AppPhase.FLAT_VALUES} desc="K-Means tonal planes isolating light and shadow masses" />
            <PhaseOverview title="Nuance" phase={AppPhase.NUANCE} desc="Full-fidelity lighting reference for delicate transitions" />
          </div>
        </div>

      </div>
    </div>
  );
};

function PhaseOverview({ title, phase, desc }: { title: string; phase: AppPhase; desc: string }) {
  return (
    <div className="p-3.5 rounded-xl bg-[#141418] border border-white/5 flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-indigo-500" />
        <span className="text-xs font-medium text-white">{title}</span>
      </div>
      <p className="text-[11px] text-white/50 leading-relaxed mt-1">{desc}</p>
    </div>
  );
}
