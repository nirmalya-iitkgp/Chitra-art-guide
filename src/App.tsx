import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as fabric from 'fabric';
import { 
  Upload, 
  Layers, 
  Box, 
  PenTool, 
  Palette, 
  Eye, 
  Target, 
  Download,
  Settings2,
  ChevronRight,
  Menu,
  X,
  CheckCircle2,
  Brush,
  Minus,
  Plus,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AppPhase, 
  Layer, 
  ProcessorSettings, 
  ProcessedLayers 
} from './types';

export default function App() {
  const [phase, setPhase] = useState<AppPhase>(AppPhase.GEOMETRY);
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedLayers, setProcessedLayers] = useState<ProcessedLayers>({});
  const [zoom, setZoom] = useState(1);
  const [brushSize, setBrushSize] = useState(2);
  const [settings, setSettings] = useState<ProcessorSettings>({
    contour: { algorithm: 'sobel', threshold: 40 },
    flatValues: { algorithm: 'kmeans', clusters: 6 },
    nuance: { algorithm: 'difference', sensitivity: 30, colorDodge: false }
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricCanvas = useRef<fabric.Canvas | null>(null);
  const workerRef = useRef<Worker | null>(null);

  // Initialize Worker
  useEffect(() => {
    workerRef.current = new Worker(new URL('./imageProcessor.worker.ts', import.meta.url), { type: 'module' });
    workerRef.current.onmessage = (e) => {
      const { type, result } = e.data;
      if (type === 'edges') updateProcessedLayer('edgeMap', result);
      if (type === 'kmeans') updateProcessedLayer('valueMap', result);
      if (type === 'difference') updateProcessedLayer('nuanceMap', result);
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
      });
      fabricCanvas.current.isDrawingMode = true;
      const brush = new fabric.PencilBrush(fabricCanvas.current);
      brush.width = brushSize;
      brush.color = '#ffffff';
      fabricCanvas.current.freeDrawingBrush = brush;

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

  // Update brush size
  useEffect(() => {
    if (fabricCanvas.current && fabricCanvas.current.freeDrawingBrush) {
      fabricCanvas.current.freeDrawingBrush.width = brushSize;
    }
  }, [brushSize]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setOriginalImage(url);
      
      const imgObj = new Image();
      imgObj.src = url;
      imgObj.onload = () => {
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
            top: finalHeight / 2
          });
          
          fabricCanvas.current.clear();
          fabricCanvas.current.add(img);
          fabricCanvas.current.renderAll();
          
          processImage(img.toCanvasElement(), AppPhase.GEOMETRY);
        });
      };
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
    }
  }, [originalImage, settings]);

  useEffect(() => {
    if (fabricCanvas.current && phase === AppPhase.NUANCE) {
       fabricCanvas.current.getObjects().forEach(obj => {
         if (obj.selectable !== false) { 
           obj.set('globalCompositeOperation', settings.nuance.colorDodge ? 'color-dodge' : 'source-over');
         }
       });
       fabricCanvas.current.renderAll();
    }
  }, [settings.nuance.colorDodge, phase]);

  const setAppPhase = (newPhase: AppPhase) => {
    setPhase(newPhase);
    if (!fabricCanvas.current || !originalImage) return;

    const objects = fabricCanvas.current.getObjects();
    const bgImage = objects.find(o => o.selectable === false) as fabric.FabricImage;

    if (bgImage) {
      const scale = bgImage.scaleX;
      const left = bgImage.left;
      const top = bgImage.top;

      if (newPhase === AppPhase.GEOMETRY) {
        bgImage.set({ opacity: 0.4, visible: true });
        fabric.FabricImage.fromURL(originalImage).then(img => {
          img.set({ 
            selectable: false, 
            evented: false, 
            opacity: 0.4,
            originX: 'center',
            originY: 'center',
            left,
            top,
            scaleX: scale,
            scaleY: scale
          });
          fabricCanvas.current?.remove(bgImage);
          fabricCanvas.current?.add(img);
          fabricCanvas.current?.sendObjectToBack(img);
        });
      } else if (newPhase === AppPhase.CONTOURS) {
          processImage(bgImage.toCanvasElement(), AppPhase.CONTOURS);
      } else if (newPhase === AppPhase.FLAT_VALUES) {
          processImage(bgImage.toCanvasElement(), AppPhase.FLAT_VALUES);
      } else if (newPhase === AppPhase.NUANCE) {
         fabric.FabricImage.fromURL(originalImage).then(img => {
          img.set({ 
            selectable: false, 
            evented: false, 
            opacity: 1,
            originX: 'center',
            originY: 'center',
            left,
            top,
            scaleX: scale,
            scaleY: scale
          });
          fabricCanvas.current?.remove(bgImage);
          fabricCanvas.current?.add(img);
          fabricCanvas.current?.sendObjectToBack(img);
        });
      }
    }
    
    fabricCanvas.current.renderAll();
  };

  useEffect(() => {
    if (originalImage && fabricCanvas.current) {
       const bgImage = fabricCanvas.current.getObjects().find(o => o.selectable === false) as fabric.FabricImage;
       if (bgImage) {
         const scale = bgImage.scaleX;
         const left = bgImage.left;
         const top = bgImage.top;

         if (phase === AppPhase.CONTOURS && processedLayers.edgeMap) {
            fabric.FabricImage.fromURL(processedLayers.edgeMap).then(img => {
                img.set({ 
                  selectable: false, 
                  evented: false, 
                  opacity: 1,
                  originX: 'center',
                  originY: 'center',
                  left,
                  top,
                  scaleX: scale,
                  scaleY: scale
                });
                fabricCanvas.current?.remove(bgImage);
                fabricCanvas.current?.add(img);
                fabricCanvas.current?.sendObjectToBack(img);
            });
         } else if (phase === AppPhase.FLAT_VALUES && processedLayers.valueMap) {
            fabric.FabricImage.fromURL(processedLayers.valueMap).then(img => {
                img.set({ 
                  selectable: false, 
                  evented: false, 
                  opacity: 1,
                  originX: 'center',
                  originY: 'center',
                  left,
                  top,
                  scaleX: scale,
                  scaleY: scale
                });
                fabricCanvas.current?.remove(bgImage);
                fabricCanvas.current?.add(img);
                fabricCanvas.current?.sendObjectToBack(img);
            });
         }
       }
    }
  }, [processedLayers, originalImage, phase]);

  const exportDrawing = () => {
    if (!fabricCanvas.current) return;
    const objects = fabricCanvas.current.getObjects();
    const bgImg = objects.find(o => o.selectable === false);
    if (bgImg) bgImg.visible = false;
    
    const dataUrl = fabricCanvas.current.toDataURL({ format: 'png' });
    const link = document.createElement('a');
    link.download = 'unbaked-drawing.png';
    link.href = dataUrl;
    link.click();
    
    if (bgImg) bgImg.visible = true;
    fabricCanvas.current.renderAll();
  };

  // Handle auto-resize on window resize
  useEffect(() => {
    const handleResize = () => {
      if (fabricCanvas.current && containerRef.current) {
        // Implementation for dynamic canvas scaling while preserving aspect ratio
        // This is complex with Fabric.js after load, so we mostly focus on container responsiveness
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full overflow-hidden font-sans bg-[#0e0e10] text-[#f0f0f2]">
      {/* Phases and Core Controls */}
      <aside className="w-full lg:w-72 bg-[#121214] border-t lg:border-t-0 lg:border-r border-white/5 flex flex-col order-last lg:order-first z-50">
        {/* Artistic Branding */}
        <div className="hidden lg:flex p-10 border-b border-white/5 flex-col items-center">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative w-20 h-20 bg-[#121214] rounded-full flex items-center justify-center text-white border border-white/10 shadow-2xl transition-transform duration-500 group-hover:scale-110">
              <Palette size={40} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-display italic tracking-tighter text-white mt-6">
            Chitra
          </h1>
          <p className="text-[10px] text-indigo-400/60 uppercase tracking-[0.2em] font-black mt-2">Unbaking your art</p>
        </div>

        <nav className="flex-1 flex lg:flex-col overflow-x-auto lg:overflow-y-auto no-scrollbar p-3 lg:p-4 gap-3 lg:space-y-4">
          <PhaseButton 
            active={phase === AppPhase.GEOMETRY} 
            icon={<Box size={18} />} 
            title="Geometry" 
            onClick={() => setAppPhase(AppPhase.GEOMETRY)}
          />
          <PhaseButton 
            active={phase === AppPhase.CONTOURS} 
            icon={<PenTool size={18} />} 
            title="Contours" 
            onClick={() => setAppPhase(AppPhase.CONTOURS)}
          />
          <PhaseButton 
            active={phase === AppPhase.FLAT_VALUES} 
            icon={<Palette size={18} />} 
            title="Flat Values" 
            onClick={() => setAppPhase(AppPhase.FLAT_VALUES)}
          />
          <PhaseButton 
            active={phase === AppPhase.NUANCE} 
            icon={<Target size={18} />} 
            title="Nuance" 
            onClick={() => setAppPhase(AppPhase.NUANCE)}
          />
        </nav>

        {/* Info panel in place of buttons */}
        <div className="hidden lg:block p-6 border-t border-white/5 text-center">
          <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-black">
            Deterministic Engine v2.5
          </p>
        </div>
      </aside>

      {/* Main Stage */}
      <main className="flex-1 relative flex flex-col overflow-hidden bg-[#0e0e10]">
        {/* Toolbar */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 sm:px-8 bg-[#121214]/90 backdrop-blur-md z-30">
          <div className="flex items-center gap-4">
            <div className="lg:hidden flex items-center gap-2">
              <span className="text-xl font-display italic text-white mr-4">Chitra</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-white/40">
                Phase {phase.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
             {/* Zoom Controls */}
             <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-lg">
                <button onClick={() => handleZoom('out')} className="p-1.5 hover:bg-white/10 rounded-md text-white/60" title="Zoom Out">
                  <ZoomOut size={14} />
                </button>
                <div className="text-[10px] font-black w-12 text-center text-white/40 select-none">
                  {Math.round(zoom * 100)}%
                </div>
                <button onClick={() => handleZoom('in')} className="p-1.5 hover:bg-white/10 rounded-md text-white/60" title="Zoom In">
                  <ZoomIn size={14} />
                </button>
                <button onClick={() => handleZoom('reset')} className="p-1.5 hover:bg-white/10 rounded-md text-white/60 border-l border-white/5 ml-1" title="Reset Zoom">
                  <Maximize2 size={14} />
                </button>
             </div>

             {/* Brush Controls */}
             <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-2 py-1.5 rounded-lg shadow-sm">
                <span className="text-[9px] font-black text-white/30 uppercase tracking-widest hidden xs:block">Brush</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setBrushSize(prev => Math.max(1, prev - 1))} className="p-1 hover:bg-white/10 rounded text-white/60">
                    <Minus size={10} />
                  </button>
                  <span className="text-[10px] font-black w-4 text-center">{brushSize}</span>
                  <button onClick={() => setBrushSize(prev => Math.min(20, prev + 1))} className="p-1 hover:bg-white/10 rounded text-white/60">
                    <Plus size={10} />
                  </button>
                </div>
             </div>

             {phase === AppPhase.CONTOURS && (
                <div className="flex items-center gap-2">
                  <select 
                    value={settings.contour.algorithm}
                    onChange={(e) => setSettings(s => ({...s, contour: {...s.contour, algorithm: e.target.value as any}}))}
                    className="text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 rounded-lg px-2 sm:px-3 py-1.5 outline-none text-white/80"
                  >
                    <option value="sobel" className="bg-[#121214]">Sobel</option>
                    <option value="laplacian" className="bg-[#121214]">Laplacian</option>
                    <option value="threshold" className="bg-[#121214]">Binary</option>
                  </select>
                </div>
             )}
             
             {phase === AppPhase.FLAT_VALUES && (
                <div className="flex items-center gap-2">
                  <select 
                    value={settings.flatValues.algorithm}
                    onChange={(e) => setSettings(s => ({...s, flatValues: {...s.flatValues, algorithm: e.target.value as any}}))}
                    className="text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 rounded-lg px-2 sm:px-3 py-1.5 outline-none text-white/80"
                  >
                    <option value="kmeans" className="bg-[#121214]">K-Means</option>
                    <option value="bilateral" className="bg-[#121214]">Painterly</option>
                  </select>
                </div>
             )}
          </div>
        </header>

        {/* Canvas Area */}
        <div ref={containerRef} className="flex-1 flex items-center justify-center p-2 sm:p-8 overflow-hidden">
          <div className="relative bg-[#1a1a1e] shadow-2xl rounded-sm overflow-hidden flex items-center justify-center border border-white/5">
            <canvas ref={canvasRef} id="main-canvas" />
            {!originalImage && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/5 pointer-events-none p-12 text-center">
                <Palette size={48} strokeWidth={1} className="mb-4" />
                <p className="text-2xl font-display italic tracking-tight text-white/20">Ready for Art</p>
              </div>
            )}
          </div>
        </div>

        {/* New Layer Footer with Integrated Buttons */}
        <footer className="h-24 lg:h-20 bg-[#121214] border-t border-white/5 px-4 sm:px-8 flex items-center justify-between z-30">
          <div className="flex items-center gap-6 flex-1 overflow-x-auto no-scrollbar py-2">
            <div className="flex gap-2 shrink-0">
              <label 
                className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 text-white/60 rounded-full hover:bg-white hover:text-black cursor-pointer transition-all active:scale-[0.9] group" 
                title="Upload New Subject"
              >
                <Upload size={18} className="group-hover:scale-110 transition-transform" />
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
              </label>
              
              {originalImage && (
                <button 
                  onClick={exportDrawing}
                  className="w-10 h-10 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-all active:scale-[0.9] shadow-lg shadow-indigo-500/20"
                  title="Save Progress"
                >
                  <Download size={18} />
                </button>
              )}
            </div>

            <div className="w-px h-8 bg-white/5 mx-2" />

            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-white/30 uppercase tracking-widest mr-4 shrink-0">Layers</span>
              <div className="flex gap-2">
              <LayerChip name="Reference" type="reference" visible />
              <LayerChip name="Drawing" type="drawing" visible active />
              
              {phase === AppPhase.NUANCE && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 shrink-0">
                  <span className="text-[9px] font-bold text-indigo-400 uppercase">Dodge</span>
                  <input 
                    type="checkbox" 
                    checked={settings.nuance.colorDodge}
                    onChange={(e) => setSettings(s => ({...s, nuance: {...s.nuance, colorDodge: e.target.checked}}))}
                    className="w-3 h-3 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>
              )}

              {isProcessing && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-600 text-white text-[9px] font-black uppercase tracking-wider animate-pulse">
                  <Settings2 size={10} className="animate-spin" />
                  Analyzing
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-[10px] font-black text-white/10 uppercase tracking-widest pl-8 border-l border-white/5 hidden xs:flex">
           {originalImage ? 'Active' : 'Idle'}
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

function LayerChip({ name, visible, active, type }: { 
  name: string, visible: boolean, active?: boolean, type: string 
}) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-full border border-white/5 transition-all shrink-0 select-none ${
      active ? 'bg-white text-black shadow-md' : 'bg-black/20 text-white/60 hover:bg-white/5'
    }`}>
      <Eye size={12} className={active ? 'text-black/60' : 'text-white/20'} />
      <span className="text-[10px] font-black uppercase tracking-widest">{name}</span>
      <div className={`w-1.5 h-1.5 rounded-full ${
        type === 'reference' ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]' : (active ? 'bg-indigo-600' : 'bg-indigo-500')
      }`} />
    </div>
  );
}
