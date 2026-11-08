import React from 'react';
import { X, Sparkles, Check, Info } from 'lucide-react';
import { PRESET_ARTWORKS } from '../data/presets';
import { PresetArtwork } from '../types';

interface PresetGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: PresetArtwork) => void;
  activePresetId?: string | null;
}

export const PresetGalleryModal: React.FC<PresetGalleryModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
  activePresetId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-[#141418] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#18181d]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Classic Masterpiece Presets</h2>
              <p className="text-xs text-white/50">Select a famous artwork to deconstruct its geometry, contours, and tonal values</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Gallery Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRESET_ARTWORKS.map((preset) => {
            const isSelected = activePresetId === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => {
                  onSelectPreset(preset);
                  onClose();
                }}
                className={`group relative flex flex-col rounded-xl overflow-hidden border transition-all duration-200 cursor-pointer text-left ${
                  isSelected 
                    ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/40 shadow-lg' 
                    : 'border-white/10 bg-[#1a1a20] hover:border-white/30 hover:bg-[#202028]'
                }`}
              >
                {/* Image preview */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/40">
                  <img
                    src={preset.src}
                    alt={preset.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                  
                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 bg-indigo-600 text-white rounded-full p-1 shadow-md">
                      <Check size={14} />
                    </div>
                  )}

                  <div className="absolute bottom-2.5 left-2.5 right-2.5">
                    <span className="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded bg-black/60 text-indigo-300 backdrop-blur-sm border border-white/10">
                      {preset.period}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                      {preset.title}
                    </h3>
                    <p className="text-xs text-white/50">
                      {preset.artist} • {preset.year}
                    </p>
                  </div>

                  <p className="text-[11px] text-white/60 line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>

                  <div className="mt-1 pt-2 border-t border-white/5 flex items-center justify-between text-xs font-medium">
                    <span className="text-indigo-400 group-hover:underline flex items-center gap-1 text-[11px]">
                      Analyze artwork →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-[#18181d] flex items-center justify-between text-xs text-white/40">
          <div className="flex items-center gap-1.5">
            <Info size={14} />
            <span>All preset masterpieces are in the public domain.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
