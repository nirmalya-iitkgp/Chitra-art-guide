export enum AppPhase {
  GEOMETRY = 'geometry',
  BLUEPRINT = 'blueprint',
  CONTOURS = 'contours',
  FLAT_VALUES = 'flat_values',
  NUANCE = 'nuance',
}

export type ContourAlgorithm = 'sobel' | 'laplacian' | 'threshold' | 'canny';
export type FlatValueAlgorithm = 'kmeans' | 'median_cut' | 'bilateral' | 'blueprint';
export type NuanceAlgorithm = 'difference' | 'luminance' | 'high_pass';

export interface ProcessorSettings {
  contour: {
    algorithm: ContourAlgorithm;
    threshold: number;
  };
  flatValues: {
    algorithm: FlatValueAlgorithm;
    clusters: number;
    smoothing: boolean;
  };
  nuance: {
    algorithm: NuanceAlgorithm;
    sensitivity: number;
    colorDodge: boolean;
  };
}

export interface ProcessedLayers {
  edgeMap?: string;
  valueMap?: string;
  nuanceMap?: string;
  blueprintMap?: string;
}

export type ArtworkCategory = 
  | 'All' 
  | 'Renaissance & Baroque' 
  | 'Impressionism & Modern' 
  | 'Romanticism & Expressionism' 
  | 'Ukiyo-e Woodblock';

export interface PresetArtwork {
  id: string;
  title: string;
  artist: string;
  year: string;
  period: string;
  category: ArtworkCategory;
  src: string;
  description: string;
  focusTip: string;
}

export interface DrawingSettings {
  isDrawing: boolean;
  brushColor: string;
  brushWidth: number;
  layerOpacity: number; // 0 to 1 for comparing layer with original reference
}
