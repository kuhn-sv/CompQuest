import { QualityLevel } from '../../interfaces/performance.types';

/**
 * Device capability detection for initial quality level selection
 * Uses various browser APIs and heuristics to determine device performance
 */

interface DeviceCapabilities {
  memory?: number;
  cores?: number;
  isMobile: boolean;
  isTablet: boolean;
  connectionSpeed?: string;
  devicePixelRatio: number;
}

/**
 * Detect device capabilities using available browser APIs
 */
export function detectDeviceCapabilities(): DeviceCapabilities {
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Device Memory API (Chrome/Edge)
  const memory = (navigator as any).deviceMemory as number | undefined;
  
  // Hardware Concurrency (CPU cores)
  const cores = navigator.hardwareConcurrency;
  
  // Mobile/Tablet detection
  const isMobile = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  const isTablet = /ipad|android(?!.*mobile)|tablet|kindle|silk/i.test(userAgent);
  
  // Connection speed (Network Information API - experimental)
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  const connectionSpeed = connection?.effectiveType;
  
  // Device pixel ratio
  const devicePixelRatio = window.devicePixelRatio || 1;
  
  return {
    memory,
    cores,
    isMobile,
    isTablet,
    connectionSpeed,
    devicePixelRatio
  };
}

/**
 * Determine initial quality level based on device capabilities
 * Strategy: Start LOW (safe), let performance monitoring upgrade if capable
 */
export function determineInitialQuality(): QualityLevel {
  const capabilities = detectDeviceCapabilities();
  
  console.log('[DeviceDetector] Detected capabilities:', capabilities);
  
  // Always start with LOW for progressive enhancement
  // Performance monitor will upgrade if device is capable
  return QualityLevel.LOW;
}

/**
 * Check if device is likely to be low-end
 * Used for additional optimizations and warnings
 */
export function isLowEndDevice(): boolean {
  const capabilities = detectDeviceCapabilities();
  
  // Low memory
  if (capabilities.memory && capabilities.memory < 4) {
    return true;
  }
  
  // Few CPU cores
  if (capabilities.cores && capabilities.cores < 4) {
    return true;
  }
  
  // Slow connection
  if (capabilities.connectionSpeed === 'slow-2g' || capabilities.connectionSpeed === '2g') {
    return true;
  }
  
  // Mobile device (often lower performance)
  if (capabilities.isMobile) {
    return true;
  }
  
  return false;
}

/**
 * Get a human-readable description of device capabilities
 */
export function getDeviceDescription(): string {
  const capabilities = detectDeviceCapabilities();
  const parts: string[] = [];
  
  if (capabilities.memory) {
    parts.push(`${capabilities.memory}GB RAM`);
  }
  
  if (capabilities.cores) {
    parts.push(`${capabilities.cores} cores`);
  }
  
  if (capabilities.isMobile) {
    parts.push('Mobile');
  } else if (capabilities.isTablet) {
    parts.push('Tablet');
  } else {
    parts.push('Desktop');
  }
  
  if (capabilities.connectionSpeed) {
    parts.push(capabilities.connectionSpeed.toUpperCase());
  }
  
  return parts.join(', ') || 'Unknown device';
}

