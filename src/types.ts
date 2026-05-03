export enum AppPhase {
  GEOMETRY = 'geometry',
  CONTOURS = 'contours',
  FLAT_VALUES = 'flat_values',
  NUANCE = 'nuance',
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  locked: boolean;
  type: 'reference' | 'drawing' | 'processed';
}

export type ContourAlgorithm = 'sobel' | 'laplacian' | 'threshold';
export type FlatValueAlgorithm = 'kmeans' | 'median_cut' | 'bilateral';
export type NuanceAlgorithm = 'difference' | 'luminance' | 'high_pass';

export interface ProcessorSettings {
  contour: {
    algorithm: ContourAlgorithm;
    threshold: number;
  };
  flatValues: {
    algorithm: FlatValueAlgorithm;
    clusters: number;
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
}
