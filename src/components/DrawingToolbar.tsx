import React from 'react';
import { 
  Pencil, 
  Trash2, 
  Eye, 
  SlidersHorizontal 
} from 'lucide-react';
import { DrawingSettings } from '../types';

interface DrawingToolbarProps {
  drawing: DrawingSettings;
  onChangeDrawing: (update: Partial<DrawingSettings>) => void;
  onClearDrawing: () => void;
}

const BRUSH_COLORS = [
  { name: 'White', value: '#ffffff' },
  { name: 'Charcoal', value: '#18181b' },
  { name: 'Crimson', value: '#ef4444' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Gold', value: '#eab308' },
];

const BRUSH_WIDTHS = [
  { label: 'Fine', value: 2 },
  { label: 'Med', value: 4 },
  { label: 'Bold', value: 8 },
];

export const DrawingToolbar: React.FC<DrawingToolbarProps> = ({
  drawing,
  onChangeDrawing,
  onClearDrawing,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-[#141418]/95 border border-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-xl text-xs text-white">
      {/* Drawing Mode Toggle */}
      <button
        onClick={() => onChangeDrawing({ isDrawing: !drawing.isDrawing })}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
          drawing.isDrawing
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
            : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'
        }`}
        title="Toggle sketch & trace pen"
      >
        <Pencil size={13} />
        <span>{drawing.isDrawing ? 'Drawing ON' : 'Draw / Trace'}</span>
      </button>

      {/* Colors & Widths (visible when drawing is active) */}
      {drawing.isDrawing && (
        <>
          <div className="h-4 w-px bg-white/10" />

          {/* Color swatches */}
          <div className="flex items-center gap-1">
            {BRUSH_COLORS.map((col) => (
              <button
                key={col.value}
                onClick={() => onChangeDrawing({ brushColor: col.value })}
                className={`w-5 h-5 rounded-full border transition-transform cursor-pointer ${
                  drawing.brushColor === col.value
                    ? 'scale-125 border-white ring-2 ring-indigo-500/50'
                    : 'border-white/20 hover:scale-110'
                }`}
                style={{ backgroundColor: col.value }}
                title={`Brush color: ${col.name}`}
              />
            ))}
          </div>

          <div className="h-4 w-px bg-white/10" />

          {/* Width toggles */}
          <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg">
            {BRUSH_WIDTHS.map((w) => (
              <button
                key={w.value}
                onClick={() => onChangeDrawing({ brushWidth: w.value })}
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                  drawing.brushWidth === w.value
                    ? 'bg-white/20 text-white'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>

          {/* Clear strokes */}
          <button
            onClick={onClearDrawing}
            className="p-1.5 text-white/40 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            title="Clear drawing strokes"
          >
            <Trash2 size={13} />
          </button>
        </>
      )}

      <div className="h-4 w-px bg-white/10 hidden sm:block" />

      {/* Layer Opacity Crossfade Slider (Compare with original painting) */}
      <div className="flex items-center gap-2 text-white/60">
        <SlidersHorizontal size={12} className="text-white/40" />
        <span className="text-[10px] uppercase tracking-wider text-white/40 hidden md:inline">Layer Opacity</span>
        <input
          type="range"
          min="0.1"
          max="1.0"
          step="0.05"
          value={drawing.layerOpacity}
          onChange={(e) => onChangeDrawing({ layerOpacity: parseFloat(e.target.value) })}
          className="w-16 sm:w-20 accent-indigo-500 h-1 bg-white/10 rounded cursor-pointer"
          title={`Layer Opacity: ${Math.round(drawing.layerOpacity * 100)}%`}
        />
        <span className="text-[10px] font-mono w-7 text-right text-white/60">
          {Math.round(drawing.layerOpacity * 100)}%
        </span>
      </div>
    </div>
  );
};
