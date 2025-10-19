import { QualityLevel, QualitySettings } from '../../interfaces/performance.types';

export const QUALITY_PRESETS: Record<QualityLevel, QualitySettings> = {
  [QualityLevel.LOW]: {
    pixelRatio: 0.5, // Ultra-low for very weak devices (75% fewer pixels than before!)
    antialias: false,
    lightCount: 1, // Only ambient + 1 directional
    targetFPS: 20, // Lower FPS target to reduce CPU load
    useMaterialSimplification: true,
    pauseAnimationWhenIdle: true // Pause after 3s inactivity to save CPU/GPU
  },
  [QualityLevel.MEDIUM]: {
    pixelRatio: 1.25, // Slightly reduced from 1.5
    antialias: true,
    lightCount: 3, // Ambient + 3 directional
    targetFPS: 45,
    useMaterialSimplification: false,
    pauseAnimationWhenIdle: false
  },
  [QualityLevel.HIGH]: {
    pixelRatio: Math.min(window.devicePixelRatio, 2),
    antialias: true,
    lightCount: 6, // Ambient + 6 directional (all sides)
    targetFPS: 60,
    useMaterialSimplification: false,
    pauseAnimationWhenIdle: false
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

