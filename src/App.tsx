import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as fabric from 'fabric';
import { 
  Upload, 
  Box, 
  PenTool, 
  Palette, 
  Target, 
  Download,
  Settings2,
  CheckCircle2,
  Minus,
  Plus,
  ZoomIn,
  ZoomOut,
  Maximize2,
  AlertCircle,
  Shapes
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AppPhase, 
  ProcessorSettings, 
  ProcessedLayers 
} from './types';

export default function App() {
  const [phase, setPhase] = useState<AppPhase>(AppPhase.GEOMETRY);
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedLayers, setProcessedLayers] = useState<ProcessedLayers>({});
  const [zoom, setZoom] = useState(1);
  const [settings, setSettings] = useState<ProcessorSettings>({
    contour: { algorithm: 'sobel', threshold: 40 },
    flatValues: { algorithm: 'kmeans', clusters: 6, smoothing: true },
    nuance: { algorithm: 'difference', sensitivity: 30, colorDodge: false }
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricCanvas = useRef<fabric.Canvas | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const bgImageRef = useRef<fabric.FabricImage | null>(null);

  // Initialize Worker
  useEffect(() => {
    workerRef.current = new Worker(new URL('./imageProcessor.worker.ts', import.meta.url), { type: 'module' });
    workerRef.current.onmessage = (e) => {
      const { type, result } = e.data;
      if (type === 'edges') updateProcessedLayer('edgeMap', result);
      if (type === 'kmeans') updateProcessedLayer('valueMap', result);
      if (type === 'difference') updateProcessedLayer('nuanceMap', result);
      if (type === 'blueprint') updateProcessedLayer('blueprintMap', result);
      setIsProcessing(false);
    };
    return () => workerRef.current?.terminate();
  }, []);

  const updateProcessedLayer = useCallback((key: keyof ProcessedLayers, imageData: ImageData) => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = imageData.width;
    tempCanvas.height = imageData.height;
    tempCanvas.getContext('2d')?.putImageData(imageData, 0, 0);
    setProcessedLayers(prev => ({ ...prev, [key]: tempCanvas.toDataURL() }));
  }, []);

  // Initialize Canvas
  useEffect(() => {
    if (canvasRef.current && !fabricCanvas.current) {
      fabricCanvas.current = new fabric.Canvas(canvasRef.current, {
        width: 800,
        height: 600,
        backgroundColor: '#121214',
        selection: false,
      });

      // Zoom via Mouse Wheel
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
  }, []);

  const handleZoom = (type: 'in' | 'out' | 'reset') => {
    if (!fabricCanvas.current) return;
    let newZoom = zoom;
    if (type === 'in') newZoom = Math.min(zoom * 1.2, 20);
    else if (type === 'out') newZoom = Math.max(zoom / 1.2, 0.1);
    else newZoom = 1;

    const center = fabricCanvas.current.getCenterPoint();
    fabricCanvas.current.zoomToPoint(center, newZoom);
    setZoom(newZoom);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setOriginalImage(url);
      setProcessedLayers({});
      
      fabric.FabricImage.fromURL(url).then((img) => {
        if (!fabricCanvas.current || !containerRef.current) return;
        
        const padding = 64;
        const maxWidth = containerRef.current.clientWidth - padding;
        const maxHeight = containerRef.current.clientHeight - padding;
        
        const scaleX = maxWidth / img.width!;
        const scaleY = maxHeight / img.height!;
        const scale = Math.min(scaleX, scaleY, 1);
        
        const finalWidth = img.width! * scale;
        const finalHeight = img.height! * scale;

        fabricCanvas.current.setDimensions({
          width: finalWidth,
          height: finalHeight
        });

        img.scale(scale);
        img.set({
          selectable: false,
          evented: false,
          opacity: 0.4,
          originX: 'center',
          originY: 'center',
          left: finalWidth / 2,
          top: finalHeight / 2,
          name: 'background-image'
        });
        
        fabricCanvas.current.clear();
        fabricCanvas.current.add(img);
        bgImageRef.current = img;
        fabricCanvas.current.renderAll();
        
        processImage(img.toCanvasElement(), phase);
      });
    };
    reader.readAsDataURL(file);
  };

  const processImage = useCallback((canvas: HTMLCanvasElement, targetPhase: AppPhase) => {
    if (!workerRef.current || !originalImage) return;
    
    setIsProcessing(true);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (targetPhase === AppPhase.CONTOURS) {
      workerRef.current.postMessage({
        type: 'edges',
        imageData,
        params: settings.contour
      });
    } else if (targetPhase === AppPhase.FLAT_VALUES) {
      workerRef.current.postMessage({
        type: 'kmeans',
        imageData,
        params: settings.flatValues
      });
    } else if (targetPhase === AppPhase.BLUEPRINT) {
      workerRef.current.postMessage({
        type: 'blueprint',
        imageData,
        params: { clusters: settings.flatValues.clusters }
      });
    } else {
      setIsProcessing(false);
    }
  }, [originalImage, settings]);

  useEffect(() => {
    if (originalImage && bgImageRef.current) {
      processImage(bgImageRef.current.toCanvasElement(), phase);
    }
  }, [phase, settings.contour.algorithm, settings.contour.threshold, settings.flatValues.algorithm, settings.flatValues.clusters]);

  const setAppPhase = (newPhase: AppPhase) => {
    setPhase(newPhase);
    if (!fabricCanvas.current || !bgImageRef.current) return;

    if (newPhase === AppPhase.GEOMETRY) {
      bgImageRef.current.set({ opacity: 0.4 });
    } else if (newPhase === AppPhase.NUANCE) {
      bgImageRef.current.set({ opacity: 1 });
    }
    
    fabricCanvas.current.renderAll();
  };

  useEffect(() => {
    if (originalImage && fabricCanvas.current && bgImageRef.current) {
      const bg = bgImageRef.current;
      const scale = bg.scaleX;
      const left = bg.left;
      const top = bg.top;

      if (phase === AppPhase.CONTOURS && processedLayers.edgeMap) {
        fabric.FabricImage.fromURL(processedLayers.edgeMap).then(img => {
          img.set({ 
            selectable: false, evented: false, 
            originX: 'center', originY: 'center',
            left, top, scaleX: scale, scaleY: scale
          });
          fabricCanvas.current?.clear();
          fabricCanvas.current?.add(img);
        });
      } else if (phase === AppPhase.FLAT_VALUES && processedLayers.valueMap) {
        fabric.FabricImage.fromURL(processedLayers.valueMap).then(img => {
          img.set({ 
            selectable: false, evented: false,
            originX: 'center', originY: 'center',
            left, top, scaleX: scale, scaleY: scale
          });
          fabricCanvas.current?.clear();
          fabricCanvas.current?.add(img);
        });
      } else if (phase === AppPhase.BLUEPRINT && processedLayers.blueprintMap) {
        fabric.FabricImage.fromURL(processedLayers.blueprintMap).then(img => {
          img.set({ 
            selectable: false, evented: false,
            originX: 'center', originY: 'center',
            left, top, scaleX: scale, scaleY: scale
          });
          fabricCanvas.current?.clear();
          fabricCanvas.current?.add(img);
        });
      } else if (phase === AppPhase.GEOMETRY || phase === AppPhase.NUANCE) {
        fabricCanvas.current.clear();
        fabricCanvas.current.add(bg);
      }
    }
  }, [processedLayers, originalImage, phase]);

  const exportAnalysis = () => {
    if (!originalImage || !fabricCanvas.current) return;
    const dataUrl = fabricCanvas.current.toDataURL({ format: 'png', multiplier: 2 });
    const link = document.createElement('a');
    link.download = `chitra-${phase}-analysis.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full overflow-hidden font-sans bg-[#0e0e10] text-[#f0f0f2]">
      {/* Phases and Core Controls */}
      <aside className="w-full lg:w-72 bg-[#121214] border-t lg:border-t-0 lg:border-r border-white/5 flex flex-col order-last lg:order-first z-50">
        <div className="hidden lg:flex p-10 border-b border-white/5 flex-col items-center">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative w-20 h-20 bg-[#121214] rounded-full flex items-center justify-center text-white border border-white/10 shadow-2xl transition-transform duration-500 group-hover:scale-110">
              <Palette size={40} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-display italic tracking-tighter text-white mt-6">Chitra</h1>
          <p className="text-[10px] text-indigo-400/60 uppercase tracking-[0.2em] font-black mt-2">Neural Extraction</p>
        </div>

        <nav className="flex-1 flex lg:flex-col overflow-x-auto lg:overflow-y-auto no-scrollbar p-3 lg:p-4 gap-3 lg:space-y-4">
          <PhaseButton active={phase === AppPhase.GEOMETRY} icon={<Box size={18} />} title="Geometry" onClick={() => setAppPhase(AppPhase.GEOMETRY)} />
          <PhaseButton active={phase === AppPhase.BLUEPRINT} icon={<Shapes size={18} />} title="Blueprint" onClick={() => setAppPhase(AppPhase.BLUEPRINT)} />
          <PhaseButton active={phase === AppPhase.CONTOURS} icon={<PenTool size={18} />} title="Contours" onClick={() => setAppPhase(AppPhase.CONTOURS)} />
          <PhaseButton active={phase === AppPhase.FLAT_VALUES} icon={<Palette size={18} />} title="Flat Values" onClick={() => setAppPhase(AppPhase.FLAT_VALUES)} />
          <PhaseButton active={phase === AppPhase.NUANCE} icon={<Target size={18} />} title="Nuance" onClick={() => setAppPhase(AppPhase.NUANCE)} />

          <div className="w-px lg:w-full lg:h-px bg-white/10 mx-1 lg:my-2 shrink-0" />

          <label className="flex-1 lg:w-full flex lg:items-center justify-center lg:justify-start gap-4 p-3 lg:p-4 rounded-xl bg-white/5 hover:bg-white hover:text-black text-white/60 transition-all cursor-pointer group active:scale-95 shrink-0">
            <div className="p-2 shrink-0 rounded-lg bg-white/5 group-hover:bg-black/5 flex items-center justify-center">
              <Upload size={18} />
            </div>
            <div className="hidden lg:block text-[11px] font-black uppercase tracking-[0.2em]">Upload</div>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
          </label>

          {originalImage && (
            <button onClick={exportAnalysis} className="flex-1 lg:w-full flex lg:items-center justify-center lg:justify-start gap-4 p-3 lg:p-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all active:scale-95 shrink-0 shadow-lg shadow-indigo-500/20 group">
              <div className="p-2 shrink-0 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20">
                <Download size={18} />
              </div>
              <div className="hidden lg:block text-[11px] font-black uppercase tracking-[0.2em]">Export</div>
            </button>
          )}
        </nav>
      </aside>

      {/* Main Stage */}
      <main className="flex-1 relative flex flex-col overflow-hidden bg-[#0e0e10]">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 sm:px-8 bg-[#121214]/90 backdrop-blur-md z-30">
          <div className="flex items-center gap-4">
            <span className="text-[11px] font-black uppercase tracking-widest text-white/40">Phase {phase.replace('_', ' ')}</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
             <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-lg">
                <button onClick={() => handleZoom('out')} className="p-1.5 hover:bg-white/10 rounded-md text-white/60"><ZoomOut size={14} /></button>
                <div className="text-[10px] font-black w-12 text-center text-white/40 select-none">{Math.round(zoom * 100)}%</div>
                <button onClick={() => handleZoom('in')} className="p-1.5 hover:bg-white/10 rounded-md text-white/60"><ZoomIn size={14} /></button>
             </div>

             <div className="flex items-center gap-4">
               {phase === AppPhase.CONTOURS && (
                 <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                    <select 
                      value={settings.contour.algorithm}
                      onChange={(e) => setSettings(s => ({...s, contour: {...s.contour, algorithm: e.target.value as any}}))}
                      className="text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 rounded-lg px-2 py-1 outline-none text-white/80"
                    >
                      <option value="sobel" className="bg-[#121214]">Sobel</option>
                      <option value="laplacian" className="bg-[#121214]">Laplacian</option>
                      <option value="threshold" className="bg-[#121214]">Binary</option>
                    </select>
                 </div>
               )}
               {(phase === AppPhase.FLAT_VALUES || phase === AppPhase.BLUEPRINT) && (
                 <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                   {phase === AppPhase.FLAT_VALUES && (
                     <select 
                       value={settings.flatValues.algorithm}
                       onChange={(e) => setSettings(s => ({...s, flatValues: {...s.flatValues, algorithm: e.target.value as any}}))}
                       className="text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 rounded-lg px-2 py-1 outline-none text-white/80 mr-2"
                     >
                       <option value="kmeans" className="bg-[#121214]">K-Means</option>
                       <option value="bilateral" className="bg-[#121214]">Painterly</option>
                     </select>
                   )}
                   
                   <div className="flex items-center gap-2">
                      <button onClick={() => setSettings(s => ({...s, flatValues: {...s.flatValues, clusters: Math.max(2, s.flatValues.clusters - 1)}}))} className="p-1 hover:bg-white/10 rounded text-white/60"><Minus size={10} /></button>
                      <span className="text-[10px] font-black w-4 text-center">{settings.flatValues.clusters}</span>
                      <button onClick={() => setSettings(s => ({...s, flatValues: {...s.flatValues, clusters: Math.min(24, s.flatValues.clusters + 1)}}))} className="p-1 hover:bg-white/10 rounded text-white/60"><Plus size={10} /></button>
                   </div>

                   <div className="w-px h-4 bg-white/10 mx-1" />

                   <label className="flex items-center gap-2 cursor-pointer group">
                     <input 
                       type="checkbox" 
                       checked={settings.flatValues.smoothing}
                       onChange={(e) => setSettings(s => ({...s, flatValues: {...s.flatValues, smoothing: e.target.checked}}))}
                       className="w-3 h-3 rounded border-white/10 bg-white/5 accent-indigo-500 cursor-pointer"
                     />
                     <span className="text-[9px] font-black uppercase text-white/40 group-hover:text-white/60 transition-colors">Smooth</span>
                   </label>
                 </div>
               )}
             </div>
          </div>
        </header>

        <div ref={containerRef} className="flex-1 flex items-center justify-center p-2 sm:p-8 overflow-hidden">
          <div className="relative bg-[#1a1a1e] shadow-2xl rounded-sm overflow-hidden flex items-center justify-center border border-white/5">
            <canvas ref={canvasRef} id="main-canvas" />
            {!originalImage && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/5 pointer-events-none p-12 text-center">
                <Palette size={48} strokeWidth={1} className="mb-4" />
                <p className="text-2xl font-display italic tracking-tight text-white/20">Ready for Analysis</p>
              </div>
            )}
          </div>
        </div>

        <footer className="h-10 bg-[#121214] border-t border-white/5 overflow-hidden flex items-center relative z-40">
          <div className="flex items-center h-full">
            <div className="bg-[#121214] h-full flex items-center gap-2 px-6 border-r border-white/5 z-10 whitespace-nowrap shadow-[10px_0_15px_-5px_rgba(0,0,0,0.5)]">
              <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-indigo-500 animate-pulse' : (originalImage ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-white/10')}`} />
              <span className="text-[10px] font-black uppercase text-white/40 tracking-wider">
                {isProcessing ? 'Pattern Extraction' : (originalImage ? 'Neural Mesh Ready' : 'System Standby')}
              </span>
            </div>
            
            <div className="flex-1 overflow-hidden pointer-events-none">
              <motion.div animate={{ x: [0, -1500] }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="flex items-center gap-20 whitespace-nowrap px-8">
                <TickerItem text="Legal Disclaimer: All uploaded images are the sole responsibility of the user." />
                <TickerItem text="Chitra does not claim or retain ownership of any user-submitted data processed via this engine." />
                <TickerItem text="Please ensure proper attribution to original copyright owners when utilizing analysis exports." />
                <TickerItem text="Deterministic analysis provided by Chitra Neural Engine v2.5." />
                <TickerItem text="Legal Disclaimer: All uploaded images are the sole responsibility of the user." />
                <TickerItem text="Chitra does not claim or retain ownership of any user-submitted data processed via this engine." />
              </motion.div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

function PhaseButton({ active, icon, title, onClick }: { 
  active: boolean, icon: React.ReactNode, title: string, onClick: () => void 
}) {
  return (
    <button 
      onClick={onClick}
      className={`flex-1 lg:w-full flex lg:items-center justify-center lg:justify-start gap-4 p-3 lg:p-4 rounded-xl transition-all duration-300 group shrink-0 ${
        active 
          ? 'bg-white shadow-xl text-black scale-[1.02]' 
          : 'bg-white/5 lg:bg-transparent hover:bg-white/5 text-white/60 hover:text-white'
      }`}
    >
      <div className={`p-2 shrink-0 rounded-lg transition-all flex items-center justify-center group-hover:scale-110 active:scale-95 ${
        active ? 'bg-black/5' : 'bg-white/5 group-hover:bg-white/10 shadow-sm border border-white/5'
      }`}>
        {icon}
      </div>
      <div className="hidden lg:block text-left">
        <div className="text-[11px] font-black uppercase tracking-[0.2em]">{title}</div>
      </div>
    </button>
  );
}

function TickerItem({ text }: { text: string }) {
  return (
    <span className="flex items-center gap-4 shrink-0">
      <AlertCircle size={10} className="text-white/20" />
      <span className="text-[10px] font-black text-white/15 uppercase tracking-[0.2em]">{text}</span>
    </span>
  );
}
