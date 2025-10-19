export enum QualityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export interface QualitySettings {
  pixelRatio: number;
  antialias: boolean;
  lightCount: number;
  targetFPS: number;
  useMaterialSimplification: boolean;
}

export interface PerformanceMetrics {
  currentFPS: number;
  averageFPS: number;
  frameCount: number;
  lastFrameTime: number;
}

