export enum AppPhase {
  GEOMETRY = 'geometry',
  CONTOURS = 'contours',
  FLAT_VALUES = 'flat_values',
  NUANCE = 'nuance',
  BLUEPRINT = 'blueprint',
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
  edgeMap?: string; // Data URL
  valueMap?: string; // Data URL
  nuanceMap?: string; // Data URL
  blueprintMap?: string; // Data URL
}
