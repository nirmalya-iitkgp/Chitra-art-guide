import React from 'react';
import { Upload, Sparkles, ArrowRight } from 'lucide-react';
import { PRESET_ARTWORKS } from '../data/presets';
import { PresetArtwork } from '../types';

interface EmptyStatePresetsProps {
  onSelectPreset: (preset: PresetArtwork) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const EmptyStatePresets: React.FC<EmptyStatePresetsProps> = ({
  onSelectPreset,
  onFileUpload,
}) => {
  return (
    <div className="w-full max-w-4xl px-4 py-8 flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
        <Sparkles size={24} />
      </div>

      <h2 className="text-2xl font-serif text-white tracking-tight mb-2">
        Choose an Artwork to Study
      </h2>
      <p className="text-sm text-white/50 max-w-md mb-8">
        Deconstruct classical masterpieces into geometric forms, contours, flat value planes, and fine nuance.
      </p>

      {/* Presets Grid */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {PRESET_ARTWORKS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onSelectPreset(preset)}
            className="group flex flex-col rounded-xl overflow-hidden border border-white/10 bg-[#16161c] hover:border-indigo-500/50 hover:bg-[#1c1c24] transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-black/40">
              <img
                src={preset.src}
                alt={preset.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70 group-hover:opacity-40 transition-opacity" />
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="font-medium text-indigo-300 flex items-center gap-1">
                  Load <ArrowRight size={10} />
                </span>
              </div>
            </div>

            <div className="p-2.5 flex flex-col gap-0.5">
              <h4 className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">
                {preset.title}
              </h4>
              <p className="text-[10px] text-white/50 truncate">
                {preset.artist}
              </p>
              <p className="text-[9px] text-white/40 mt-1">
                {preset.year}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Or Upload Custom Image */}
      <div className="flex items-center gap-4">
        <div className="h-px w-16 bg-white/10" />
        <span className="text-xs text-white/40">or study your own reference</span>
        <div className="h-px w-16 bg-white/10" />
      </div>

      <div className="mt-4">
        <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs font-medium cursor-pointer transition-colors shadow-sm">
          <Upload size={14} className="text-white/70" />
          <span>Upload Image File</span>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={onFileUpload}
          />
        </label>
      </div>
    </div>
  );
};
