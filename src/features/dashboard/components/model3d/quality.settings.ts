import { QualityLevel, QualitySettings } from '../../interfaces/performance.types';

export const QUALITY_PRESETS: Record<QualityLevel, QualitySettings> = {
  [QualityLevel.LOW]: {
    pixelRatio: 1,
    antialias: false,
    lightCount: 1, // Only ambient + 1 directional
    targetFPS: 30,
    useMaterialSimplification: true
  },
  [QualityLevel.MEDIUM]: {
    pixelRatio: 1.5,
    antialias: true,
    lightCount: 3, // Ambient + 3 directional
    targetFPS: 45,
    useMaterialSimplification: false
  },
  [QualityLevel.HIGH]: {
    pixelRatio: Math.min(window.devicePixelRatio, 2),
    antialias: true,
    lightCount: 6, // Ambient + 6 directional (all sides)
    targetFPS: 60,
    useMaterialSimplification: false
  }
};

/**
 * Get quality settings for a specific quality level
 */
export function getQualitySettings(quality: QualityLevel): QualitySettings {
  return QUALITY_PRESETS[quality];
}

/**
 * Calculate frame delay for target FPS
 */
export function getFrameDelay(targetFPS: number): number {
  return 1000 / targetFPS;
}

