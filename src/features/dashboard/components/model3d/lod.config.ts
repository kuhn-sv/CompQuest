import { QualityLevel } from '../../interfaces/performance.types';

/**
 * LOD (Level of Detail) Configuration
 * Maps quality levels to their corresponding 3D model files
 */

export interface LODConfig {
  modelPath: string;
  fileSize: string; // For logging/debugging
}

export const LOD_MODELS: Record<QualityLevel, LODConfig> = {
  [QualityLevel.LOW]: {
    modelPath: '/motherboard__components_low.glb',
    fileSize: '8MB'
  },
  [QualityLevel.MEDIUM]: {
    modelPath: '/motherboard__components.glb',
    fileSize: '15MB'
  },
  [QualityLevel.HIGH]: {
    modelPath: '/motherboard__components.glb',
    fileSize: '15MB'
  }
};

/**
 * Get the model path for a specific quality level
 */
export function getModelPathForQuality(quality: QualityLevel): string {
  return LOD_MODELS[quality].modelPath;
}

/**
 * Check if quality upgrade requires loading a new model
 */
export function requiresModelSwap(currentQuality: QualityLevel, newQuality: QualityLevel): boolean {
  const currentPath = LOD_MODELS[currentQuality].modelPath;
  const newPath = LOD_MODELS[newQuality].modelPath;
  return currentPath !== newPath;
}

/**
 * Get file size info for a quality level (for logging)
 */
export function getModelFileSize(quality: QualityLevel): string {
  return LOD_MODELS[quality].fileSize;
}

