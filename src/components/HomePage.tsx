import React, { useState, useMemo } from 'react';
import { Upload, ArrowRight, Play, Search, Filter } from 'lucide-react';
import { PRESET_ARTWORKS } from '../data/presets';
import { PresetArtwork, ArtworkCategory, AppPhase } from '../types';

interface HomePageProps {
  onSelectPreset: (preset: PresetArtwork) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResumeStudio?: () => void;
  hasActiveArtwork: boolean;
  activePresetTitle?: string;
}

const CATEGORIES: ArtworkCategory[] = [
  'All',
  'Renaissance & Baroque',
  'Impressionism & Modern',
  'Romanticism & Expressionism',
  'Ukiyo-e Woodblock'
];

export const HomePage: React.FC<HomePageProps> = ({
  onSelectPreset,
  onFileUpload,
  onResumeStudio,
  hasActiveArtwork,
  activePresetTitle,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ArtworkCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPresets = useMemo(() => {
    return PRESET_ARTWORKS.filter((preset) => {
      const matchesCategory = selectedCategory === 'All' || preset.category === selectedCategory;
      const matchesSearch = 
        preset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        preset.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        preset.period.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="flex-1 overflow-y-auto bg-[#0e0e10] text-[#f0f0f2] p-4 sm:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-10">
        
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
              Deconstruct classical masterpieces into structural learning layers: geometry, contour lines, flat tonal planes, and surface nuance.
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

        {/* Search & Category Filter Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-white text-black'
                    : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative min-w-[220px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search artist or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#141418] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-white/40 outline-none focus:border-indigo-500/50"
            />
          </div>
        </div>

        {/* Dynamic Artworks Layout */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">
              Classical Masterpieces
            </h2>
            <span className="text-xs font-mono text-white/40">
              {filteredPresets.length} of {PRESET_ARTWORKS.length} Artworks
            </span>
          </div>

          {/* Masterpieces Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredPresets.map((preset) => (
              <div
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                className="group flex flex-col rounded-2xl overflow-hidden border border-white/10 bg-[#141418] hover:border-indigo-500/50 hover:bg-[#181820] transition-all duration-300 cursor-pointer shadow-lg hover:shadow-indigo-500/10"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/60">
                  <img
                    src={preset.src}
                    alt={preset.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141418] via-transparent to-transparent opacity-80" />
                  
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-black/70 text-indigo-300 backdrop-blur-md border border-white/10">
                      {preset.period}
                    </span>
                  </div>

                  <div className="absolute bottom-2.5 left-3 right-3 text-white">
                    <h3 className="text-sm font-semibold group-hover:text-indigo-300 transition-colors truncate">
                      {preset.title}
                    </h3>
                    <p className="text-[11px] text-white/60 truncate">
                      {preset.artist} • {preset.year}
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 flex flex-col flex-1 justify-between gap-3 bg-[#141418]">
                  <p className="text-xs text-white/70 leading-relaxed line-clamp-3">
                    {preset.description}
                  </p>

                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-[11px] text-white/60">
                    <span className="text-indigo-400 font-medium">Study Focus: </span>
                    {preset.focusTip}
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
                    <span>Study Artwork</span>
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            ))}

            {/* Merged Upload Card */}
            <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.02] hover:bg-white/[0.05] hover:border-indigo-500/50 transition-all p-6 text-center cursor-pointer group min-h-[300px]">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Upload size={20} />
              </div>
              <h3 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                Upload Custom Image
              </h3>
              <p className="text-xs text-white/50 max-w-xs mt-1 leading-relaxed">
                Analyze any personal portrait, figure sketch, or landscape photo.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/10 group-hover:bg-indigo-600 text-white text-xs font-medium transition-colors">
                <span>Browse PNG / JPG</span>
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

        {/* Deconstruction Pipeline Guide */}
        <div className="pt-8 border-t border-white/10">
          <h2 className="text-sm font-semibold text-white mb-3">Deconstruction Pipeline</h2>
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

function PhaseOverview({ title, desc }: { title: string; phase: AppPhase; desc: string }) {
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
