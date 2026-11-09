import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as fabric from 'fabric';
import { 
  Box, 
  PenTool, 
  Palette, 
  Target, 
  Download,
  Minus,
  Plus,
  ZoomIn,
  ZoomOut,
  Shapes,
  Sparkles,
  ArrowLeft,
  Upload,
  Info
} from 'lucide-react';
import { 
  AppPhase, 
  ProcessorSettings, 
  ProcessedLayers,
  PresetArtwork,
  DrawingSettings
} from './types';
import { HomePage } from './components/HomePage';
import { DrawingToolbar } from './components/DrawingToolbar';

type ViewMode = 'home' | 'studio';

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [phase, setPhase] = useState<AppPhase>(AppPhase.GEOMETRY);
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<PresetArtwork | null>(null);
  const [processedLayers, setProcessedLayers] = useState<ProcessedLayers>({});
  const [zoom, setZoom] = useState(1);
  const [settings, setSettings] = useState<ProcessorSettings>({
    contour: { algorithm: 'sobel', threshold: 40 },
    flatValues: { algorithm: 'kmeans', clusters: 6, smoothing: true },
    nuance: { algorithm: 'difference', sensitivity: 30, colorDodge: false }
  });

  const [drawing, setDrawing] = useState<DrawingSettings>({
    isDrawing: false,
    brushColor: '#ffffff',
    brushWidth: 2,
    layerOpacity: 1.0,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricCanvas = useRef<fabric.Canvas | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const bgImageRef = useRef<fabric.FabricImage | null>(null);
  const activeLayerImgRef = useRef<fabric.FabricImage | null>(null);
  const sourceImageDataRef = useRef<ImageData | null>(null);

  // Initialize Web Worker for background image processing
  useEffect(() => {
    workerRef.current = new Worker(new URL('./imageProcessor.worker.ts', import.meta.url), { type: 'module' });
    
    workerRef.current.onmessage = (e) => {
      const { type, result } = e.data;
      if (!result) {
        setIsProcessing(false);
        return;
      }

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = result.width;
      tempCanvas.height = result.height;
      tempCanvas.getContext('2d')?.putImageData(result, 0, 0);
      const dataUrl = tempCanvas.toDataURL();

      if (type === 'edges') {
        setProcessedLayers(prev => ({ ...prev, edgeMap: dataUrl }));
      } else if (type === 'kmeans') {
        setProcessedLayers(prev => ({ ...prev, valueMap: dataUrl }));
      } else if (type === 'difference') {
        setProcessedLayers(prev => ({ ...prev, nuanceMap: dataUrl }));
      } else if (type === 'blueprint') {
        setProcessedLayers(prev => ({ ...prev, blueprintMap: dataUrl }));
      }
      setIsProcessing(false);
    };

    return () => workerRef.current?.terminate();
  }, []);

  // Initialize Fabric Canvas once when switching to Studio mode
  useEffect(() => {
    if (viewMode === 'studio' && canvasRef.current && !fabricCanvas.current) {
      fabricCanvas.current = new fabric.Canvas(canvasRef.current, {
        width: 800,
        height: 600,
        backgroundColor: '#121214',
        selection: false,
      });

      fabricCanvas.current.on('mouse:wheel', (opt) => {
        const delta = opt.e.deltaY;
        let newZoom = fabricCanvas.current!.getZoom();
        newZoom *= 0.999 ** delta;
        if (newZoom > 20) newZoom = 20;
        if (newZoom < 0.1) newZoom = 0.1;
        
        const point = new fabric.Point(opt.e.offsetX, opt.e.offsetY);
        fabricCanvas.current!.zoomToPoint(point, newZoom);
        setZoom(newZoom);
        opt.e.preventDefault();
        opt.e.stopPropagation();
      });
    }
  }, [viewMode]);

  // Sync drawing settings with Fabric Canvas
  useEffect(() => {
    if (!fabricCanvas.current) return;
    fabricCanvas.current.isDrawingMode = drawing.isDrawing;
    if (fabricCanvas.current.freeDrawingBrush) {
      fabricCanvas.current.freeDrawingBrush.color = drawing.brushColor;
      fabricCanvas.current.freeDrawingBrush.width = drawing.brushWidth;
    }
  }, [drawing.isDrawing, drawing.brushColor, drawing.brushWidth]);

  // Dispatch work to worker using clean source ImageData
  const processWithWorker = useCallback((imgData: ImageData | null, targetPhase: AppPhase) => {
    if (!workerRef.current || !imgData) return;

    if (targetPhase === AppPhase.CONTOURS) {
      setIsProcessing(true);
      workerRef.current.postMessage({
        type: 'edges',
        imageData: imgData,
        params: settings.contour
      });
    } else if (targetPhase === AppPhase.FLAT_VALUES) {
      setIsProcessing(true);
      workerRef.current.postMessage({
        type: 'kmeans',
        imageData: imgData,
        params: settings.flatValues
      });
    } else if (targetPhase === AppPhase.BLUEPRINT) {
      setIsProcessing(true);
      workerRef.current.postMessage({
        type: 'blueprint',
        imageData: imgData,
        params: { clusters: settings.flatValues.clusters }
      });
    } else {
      setIsProcessing(false);
    }
  }, [settings]);

  // Load Artwork from URL (Presets or Uploaded File)
  const loadArtworkUrl = useCallback((url: string, preset: PresetArtwork | null = null) => {
    setOriginalImage(url);
    setActivePreset(preset);
    setViewMode('studio');
    setProcessedLayers({});
    setIsProcessing(true);

    const imgEl = new Image();
    imgEl.crossOrigin = 'anonymous';

    imgEl.onload = () => {
      // Pristine offscreen canvas (max 800px)
      const maxDim = 800;
      const scale = Math.min(maxDim / imgEl.naturalWidth, maxDim / imgEl.naturalHeight, 1);
      const w = Math.round(imgEl.naturalWidth * scale);
      const h = Math.round(imgEl.naturalHeight * scale);

      const offscreen = document.createElement('canvas');
      offscreen.width = w;
      offscreen.height = h;
      const ctx = offscreen.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(imgEl, 0, 0, w, h);
      const imgData = ctx.getImageData(0, 0, w, h);
      sourceImageDataRef.current = imgData;

      // Render into Fabric canvas
      fabric.FabricImage.fromURL(url, { crossOrigin: 'anonymous' }).then((fabricImg) => {
        if (!fabricCanvas.current || !containerRef.current) return;
        
        const padding = 48;
        const maxWidth = Math.max(containerRef.current.clientWidth - padding, 320);
        const maxHeight = Math.max(containerRef.current.clientHeight - padding, 320);

        const fScaleX = maxWidth / fabricImg.width!;
        const fScaleY = maxHeight / fabricImg.height!;
        const fScale = Math.min(fScaleX, fScaleY, 1);

        const finalWidth = fabricImg.width! * fScale;
        const finalHeight = fabricImg.height! * fScale;

        fabricCanvas.current.setDimensions({
          width: finalWidth,
          height: finalHeight
        });

        fabricImg.scale(fScale);
        fabricImg.set({
          selectable: false,
          evented: false,
          opacity: phase === AppPhase.GEOMETRY ? 0.4 : 1,
          originX: 'center',
          originY: 'center',
          left: finalWidth / 2,
          top: finalHeight / 2,
          name: 'background-image'
        });

        fabricCanvas.current.clear();
        fabricCanvas.current.add(fabricImg);
        bgImageRef.current = fabricImg;
        activeLayerImgRef.current = null;
        fabricCanvas.current.renderAll();

        processWithWorker(imgData, phase);
      });
    };

    imgEl.src = url;
  }, [phase, processWithWorker]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      loadArtworkUrl(url, null);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (preset: PresetArtwork) => {
    loadArtworkUrl(preset.src, preset);
  };

  // Re-process when settings change
  useEffect(() => {
    if (sourceImageDataRef.current && (phase === AppPhase.CONTOURS || phase === AppPhase.FLAT_VALUES || phase === AppPhase.BLUEPRINT)) {
      processWithWorker(sourceImageDataRef.current, phase);
    }
  }, [phase, settings.contour.algorithm, settings.contour.threshold, settings.flatValues.algorithm, settings.flatValues.clusters, settings.flatValues.smoothing, processWithWorker]);

  // Handle phase changes
  const setAppPhase = (newPhase: AppPhase) => {
    setPhase(newPhase);
    setViewMode('studio');

    if (!sourceImageDataRef.current) return;

    if (newPhase === AppPhase.GEOMETRY && bgImageRef.current && fabricCanvas.current) {
      if (activeLayerImgRef.current) {
        fabricCanvas.current.remove(activeLayerImgRef.current);
        activeLayerImgRef.current = null;
      }
      bgImageRef.current.set({ opacity: 0.4 * drawing.layerOpacity });
      fabricCanvas.current.renderAll();
    } else if (newPhase === AppPhase.NUANCE && bgImageRef.current && fabricCanvas.current) {
      if (activeLayerImgRef.current) {
        fabricCanvas.current.remove(activeLayerImgRef.current);
        activeLayerImgRef.current = null;
      }
      bgImageRef.current.set({ opacity: 1.0 * drawing.layerOpacity });
      fabricCanvas.current.renderAll();
    } else {
      processWithWorker(sourceImageDataRef.current, newPhase);
    }
  };

  // Render computed layer onto Fabric Canvas
  useEffect(() => {
    if (!fabricCanvas.current || !bgImageRef.current) return;
    const bg = bgImageRef.current;
    const scale = bg.scaleX;
    const left = bg.left;
    const top = bg.top;

    const renderLayer = (dataUrl?: string) => {
      if (!dataUrl || !fabricCanvas.current) return;
      
      fabric.FabricImage.fromURL(dataUrl).then(layerImg => {
        layerImg.set({ 
          selectable: false, 
          evented: false, 
          originX: 'center', 
          originY: 'center',
          left, 
          top, 
          scaleX: scale, 
          scaleY: scale,
          opacity: drawing.layerOpacity
        });

        // Keep background image below layer
        bg.set({ opacity: 1 - drawing.layerOpacity + 0.15 });

        if (activeLayerImgRef.current) {
          fabricCanvas.current?.remove(activeLayerImgRef.current);
        }
        
        fabricCanvas.current?.insertAt(1, layerImg);

        activeLayerImgRef.current = layerImg;
        fabricCanvas.current?.renderAll();
      });
    };

    if (phase === AppPhase.CONTOURS && processedLayers.edgeMap) {
      renderLayer(processedLayers.edgeMap);
    } else if (phase === AppPhase.FLAT_VALUES && processedLayers.valueMap) {
      renderLayer(processedLayers.valueMap);
    } else if (phase === AppPhase.BLUEPRINT && processedLayers.blueprintMap) {
      renderLayer(processedLayers.blueprintMap);
    } else if (phase === AppPhase.GEOMETRY) {
      if (activeLayerImgRef.current) {
        fabricCanvas.current.remove(activeLayerImgRef.current);
        activeLayerImgRef.current = null;
      }
      bg.set({ opacity: 0.4 * drawing.layerOpacity });
      fabricCanvas.current.renderAll();
    } else if (phase === AppPhase.NUANCE) {
      if (activeLayerImgRef.current) {
        fabricCanvas.current.remove(activeLayerImgRef.current);
        activeLayerImgRef.current = null;
      }
      bg.set({ opacity: 1.0 * drawing.layerOpacity });
      fabricCanvas.current.renderAll();
    }
  }, [processedLayers, phase, drawing.layerOpacity]);

  const handleClearDrawing = () => {
    if (!fabricCanvas.current) return;
    const objects = fabricCanvas.current.getObjects();
    // Remove only drawn path strokes
    objects.forEach(obj => {
      if (obj.type === 'path') {
        fabricCanvas.current?.remove(obj);
      }
    });
    fabricCanvas.current.renderAll();
  };

  const handleZoom = (type: 'in' | 'out') => {
    if (!fabricCanvas.current) return;
    let newZoom = zoom;
    if (type === 'in') newZoom = Math.min(zoom * 1.2, 20);
    else newZoom = Math.max(zoom / 1.2, 0.1);

    const center = fabricCanvas.current.getCenterPoint();
    fabricCanvas.current.zoomToPoint(center, newZoom);
    setZoom(newZoom);
  };

  const exportAnalysis = () => {
    if (!originalImage || !fabricCanvas.current) return;
    const dataUrl = fabricCanvas.current.toDataURL({ format: 'png', multiplier: 2 });
    const link = document.createElement('a');
    link.download = `chitra-${activePreset ? activePreset.id : 'artwork'}-${phase}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full overflow-hidden font-sans bg-[#0e0e10] text-[#f0f0f2]">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-72 bg-[#121214] border-t lg:border-t-0 lg:border-r border-white/5 flex flex-col order-last lg:order-first z-40">
        <div 
          onClick={() => setViewMode('home')}
          className="hidden lg:flex p-6 border-b border-white/5 flex-col items-center cursor-pointer group"
        >
          <div className="w-12 h-12 bg-indigo-600/20 text-indigo-400 rounded-2xl flex items-center justify-center border border-indigo-500/30 shadow-lg mb-2.5 transition-transform group-hover:scale-105">
            <Palette size={24} />
          </div>
          <h1 className="text-2xl font-serif text-white tracking-tight">Chitra</h1>
          <p className="text-xs text-white/50 mt-0.5">The Art Guide</p>
        </div>

        <nav className="flex-1 flex lg:flex-col overflow-x-auto lg:overflow-y-auto no-scrollbar p-3 lg:p-4 gap-2 lg:gap-3">
          <PhaseButton 
            active={viewMode === 'studio' && phase === AppPhase.GEOMETRY} 
            icon={<Box size={18} />} 
            title="Geometry" 
            onClick={() => setAppPhase(AppPhase.GEOMETRY)} 
          />
          <PhaseButton 
            active={viewMode === 'studio' && phase === AppPhase.BLUEPRINT} 
            icon={<Shapes size={18} />} 
            title="Blueprint" 
            onClick={() => setAppPhase(AppPhase.BLUEPRINT)} 
          />
          <PhaseButton 
            active={viewMode === 'studio' && phase === AppPhase.CONTOURS} 
            icon={<PenTool size={18} />} 
            title="Contours" 
            onClick={() => setAppPhase(AppPhase.CONTOURS)} 
          />
          <PhaseButton 
            active={viewMode === 'studio' && phase === AppPhase.FLAT_VALUES} 
            icon={<Palette size={18} />} 
            title="Flat Values" 
            onClick={() => setAppPhase(AppPhase.FLAT_VALUES)} 
          />
          <PhaseButton 
            active={viewMode === 'studio' && phase === AppPhase.NUANCE} 
            icon={<Target size={18} />} 
            title="Nuance" 
            onClick={() => setAppPhase(AppPhase.NUANCE)} 
          />

          <div className="w-px lg:w-full lg:h-px bg-white/10 mx-1 lg:my-1 shrink-0" />

          {/* Unified Home Page & Upload Hub Button */}
          <button
            onClick={() => setViewMode('home')}
            className={`flex-1 lg:w-full flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl border transition-all cursor-pointer group active:scale-95 shrink-0 ${
              viewMode === 'home'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30'
                : 'bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/30 text-indigo-300'
            }`}
          >
            <div className={`p-2 shrink-0 rounded-lg flex items-center justify-center ${
              viewMode === 'home' ? 'bg-white/20 text-white' : 'bg-indigo-500/20 text-indigo-400'
            }`}>
              <Sparkles size={18} />
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-white">Artworks Library</div>
              <div className="text-[10px] text-white/50">15 Presets & Upload</div>
            </div>
          </button>

          {/* Quick Direct Upload file input */}
          <label className="flex-1 lg:w-full flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer group active:scale-95 shrink-0">
            <div className="p-2 shrink-0 rounded-lg bg-white/5 flex items-center justify-center">
              <Upload size={18} />
            </div>
            <div className="hidden lg:block text-xs font-medium">Quick Upload</div>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
          </label>

          {originalImage && viewMode === 'studio' && (
            <button 
              onClick={exportAnalysis} 
              className="flex-1 lg:w-full flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-all active:scale-95 shrink-0 border border-white/10"
            >
              <div className="p-2 shrink-0 rounded-lg bg-white/10 flex items-center justify-center">
                <Download size={18} />
              </div>
              <div className="hidden lg:block text-xs font-medium">Export PNG</div>
            </button>
          )}
        </nav>
      </aside>

      {/* Main Content Area: Home Page OR Studio */}
      {viewMode === 'home' ? (
        <HomePage
          onSelectPreset={handleSelectPreset}
          onFileUpload={handleFileUpload}
          onResumeStudio={() => setViewMode('studio')}
          hasActiveArtwork={Boolean(originalImage)}
          activePresetTitle={activePreset?.title}
        />
      ) : (
        <main className="flex-1 relative flex flex-col overflow-hidden bg-[#0e0e10]">
          {/* Studio Top Header */}
          <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 sm:px-6 bg-[#121214]/90 backdrop-blur-md z-30">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode('home')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/80 transition-colors"
                title="Return to Artworks Home"
              >
                <ArrowLeft size={14} />
                <span className="hidden sm:inline">Artworks Home</span>
              </button>

              <div className="h-4 w-px bg-white/10 hidden sm:block" />

              <div className="flex items-center gap-2">
                <span className="text-xs text-white/50 capitalize">
                  Phase: <strong className="text-white font-semibold">{phase.replace('_', ' ')}</strong>
                </span>
                {activePreset && (
                  <span className="hidden md:inline-block text-[11px] font-medium px-2 py-0.5 rounded bg-white/5 text-indigo-300 border border-white/10">
                    {activePreset.title} ({activePreset.artist})
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-lg">
                <button onClick={() => handleZoom('out')} className="p-1.5 hover:bg-white/10 rounded-md text-white/60 hover:text-white" title="Zoom Out">
                  <ZoomOut size={14} />
                </button>
                <div className="text-[10px] font-mono w-12 text-center text-white/60 select-none">
                  {Math.round(zoom * 100)}%
                </div>
                <button onClick={() => handleZoom('in')} className="p-1.5 hover:bg-white/10 rounded-md text-white/60 hover:text-white" title="Zoom In">
                  <ZoomIn size={14} />
                </button>
              </div>

              {/* Algorithm Parameter Controls */}
              {phase === AppPhase.CONTOURS && (
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                  <span className="text-xs text-white/40 hidden md:inline">Kernel</span>
                  <select 
                    value={settings.contour.algorithm}
                    onChange={(e) => setSettings(s => ({...s, contour: {...s.contour, algorithm: e.target.value as any}}))}
                    className="text-xs bg-[#121214] border border-white/10 rounded px-2 py-0.5 outline-none text-white/80"
                  >
                    <option value="sobel">Sobel</option>
                    <option value="laplacian">Laplacian</option>
                    <option value="threshold">Binary</option>
                  </select>
                </div>
              )}

              {(phase === AppPhase.FLAT_VALUES || phase === AppPhase.BLUEPRINT) && (
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                  {phase === AppPhase.FLAT_VALUES && (
                    <select 
                      value={settings.flatValues.algorithm}
                      onChange={(e) => setSettings(s => ({...s, flatValues: {...s.flatValues, algorithm: e.target.value as any}}))}
                      className="text-xs bg-[#121214] border border-white/10 rounded px-2 py-0.5 outline-none text-white/80 mr-1"
                    >
                      <option value="kmeans">K-Means</option>
                      <option value="bilateral">Painterly</option>
                    </select>
                  )}
                  
                  <span className="text-xs text-white/40">Planes</span>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => setSettings(s => ({...s, flatValues: {...s.flatValues, clusters: Math.max(2, s.flatValues.clusters - 1)}}))} 
                      className="p-1 hover:bg-white/10 rounded text-white/60"
                    >
                      <Minus size={11} />
                    </button>
                    <span className="text-xs font-mono font-medium w-4 text-center">{settings.flatValues.clusters}</span>
                    <button 
                      onClick={() => setSettings(s => ({...s, flatValues: {...s.flatValues, clusters: Math.min(24, s.flatValues.clusters + 1)}}))} 
                      className="p-1 hover:bg-white/10 rounded text-white/60"
                    >
                      <Plus size={11} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* Canvas Display */}
          <div ref={containerRef} className="flex-1 flex items-center justify-center p-3 sm:p-6 overflow-hidden relative">
            <div className="relative bg-[#18181d] shadow-2xl rounded-lg overflow-hidden flex items-center justify-center border border-white/10">
              <canvas ref={canvasRef} id="main-canvas" />
            </div>

            {/* Floating Drawing & Layer Opacity Toolbar */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
              <DrawingToolbar
                drawing={drawing}
                onChangeDrawing={(update) => setDrawing(d => ({ ...d, ...update }))}
                onClearDrawing={handleClearDrawing}
              />
            </div>

            {/* Study Tip for Active Preset */}
            {activePreset && (
              <div className="absolute bottom-4 left-6 right-6 hidden md:flex items-center gap-3 p-3 rounded-xl bg-[#141418]/90 border border-white/10 backdrop-blur-md shadow-xl max-w-xl mx-auto z-20">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <Info size={16} />
                </div>
                <div className="flex-1 text-xs">
                  <p className="text-white font-medium">
                    {activePreset.title} • {activePreset.artist} ({activePreset.year})
                  </p>
                  <p className="text-white/60 text-[11px] mt-0.5">
                    {activePreset.focusTip}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Status */}
          <footer className="h-9 bg-[#121214] border-t border-white/5 flex items-center justify-between px-4 text-xs text-white/40">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-indigo-400 animate-pulse' : 'bg-emerald-400'}`} />
              <span>
                {isProcessing ? 'Processing algorithm...' : `Layer ready: ${phase.replace('_', ' ')}`}
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-4 text-[11px]">
              <span>Use the Draw / Trace tool above to sketch contours or geometric gesture</span>
            </div>
          </footer>
        </main>
      )}
    </div>
  );
}

function PhaseButton({ active, icon, title, onClick }: { 
  active: boolean, icon: React.ReactNode, title: string, onClick: () => void 
}) {
  return (
    <button 
      onClick={onClick}
      className={`flex-1 lg:w-full flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl transition-all duration-200 group shrink-0 ${
        active 
          ? 'bg-white text-black font-semibold shadow-md' 
          : 'bg-white/5 lg:bg-transparent hover:bg-white/5 text-white/70 hover:text-white'
      }`}
    >
      <div className={`p-2 shrink-0 rounded-lg transition-colors flex items-center justify-center ${
        active ? 'bg-black/10 text-black' : 'bg-white/5 group-hover:bg-white/10'
      }`}>
        {icon}
      </div>
      <div className="hidden lg:block text-xs">
        {title}
      </div>
    </button>
  );
}
