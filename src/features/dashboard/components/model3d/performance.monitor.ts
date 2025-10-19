import { QualityLevel, PerformanceMetrics } from '../../interfaces/performance.types';

const FPS_SAMPLE_SIZE = 60; // Track last 60 frames
const UPGRADE_DELAY_LOW_TO_MEDIUM = 2000; // 2 seconds stable before LOW→MEDIUM
const UPGRADE_DELAY_MEDIUM_TO_HIGH = 3000; // 3 seconds stable before MEDIUM→HIGH
const DOWNGRADE_DELAY = 500; // 0.5 seconds before downgrade
const FPS_CRITICAL_THRESHOLD = 15; // Below this = unusable, recommend 2D fallback
const FPS_LOW_THRESHOLD = 20; // Reduced from 25 for more aggressive optimization
const FPS_MEDIUM_THRESHOLD = 35; // Reduced from 45 (easier upgrade to MEDIUM)
const FPS_HIGH_THRESHOLD = 50; // New threshold for HIGH quality
const CRITICAL_DURATION = 5000; // 5 seconds of critical FPS before recommending 2D

export class PerformanceMonitor {
  private frameTimes: number[] = [];
  private lastFrameTime: number = performance.now();
  private frameCount: number = 0;
  private currentQuality: QualityLevel = QualityLevel.HIGH;
  private lastQualityChangeTime: number = performance.now();
  private stabilityTimer: number | null = null;
  private onQualityChangeCallback?: (quality: QualityLevel) => void;
  private onCriticalPerformanceCallback?: () => void;
  private criticalPerformanceStartTime: number | null = null;

  constructor(initialQuality: QualityLevel = QualityLevel.HIGH) {
    this.currentQuality = initialQuality;
  }

  /**
   * Register a callback to be called when quality level should change
   */
  public onQualityChange(callback: (quality: QualityLevel) => void): void {
    this.onQualityChangeCallback = callback;
  }

  /**
   * Register a callback to be called when performance is critically low
   * Suggests falling back to 2D view
   */
  public onCriticalPerformance(callback: () => void): void {
    this.onCriticalPerformanceCallback = callback;
  }

  /**
   * Call this at the start of each animation frame
   */
  public recordFrame(): void {
    const now = performance.now();
    const deltaTime = now - this.lastFrameTime;
    
    if (deltaTime > 0) {
      const fps = 1000 / deltaTime;
      this.frameTimes.push(fps);
      
      // Keep only the last N frames
      if (this.frameTimes.length > FPS_SAMPLE_SIZE) {
        this.frameTimes.shift();
      }
      
      this.frameCount++;
      this.lastFrameTime = now;
      
      // Check if we need to adjust quality (only after we have enough samples)
      if (this.frameTimes.length >= FPS_SAMPLE_SIZE / 2) {
        this.evaluatePerformance();
      }
    }
  }

  /**
   * Get current performance metrics
   */
  public getMetrics(): PerformanceMetrics {
    const averageFPS = this.calculateAverageFPS();
    const currentFPS = this.frameTimes.length > 0 
      ? this.frameTimes[this.frameTimes.length - 1] 
      : 0;

    return {
      currentFPS,
      averageFPS,
      frameCount: this.frameCount,
      lastFrameTime: this.lastFrameTime
    };
  }

  /**
   * Get current quality level
   */
  public getCurrentQuality(): QualityLevel {
    return this.currentQuality;
  }

  /**
   * Calculate average FPS from recorded frames
   */
  private calculateAverageFPS(): number {
    if (this.frameTimes.length === 0) return 0;
    
    const sum = this.frameTimes.reduce((acc, fps) => acc + fps, 0);
    return sum / this.frameTimes.length;
  }

  /**
   * Evaluate performance and adjust quality if needed
   */
  private evaluatePerformance(): void {
    const avgFPS = this.calculateAverageFPS();
    
    // Check for critical performance (recommend 2D fallback)
    this.checkCriticalPerformance(avgFPS);
    
    const targetQuality = this.determineTargetQuality(avgFPS);
    
    // If target quality is different, check if enough time has passed
    if (targetQuality !== this.currentQuality) {
      const now = performance.now();
      const timeSinceLastChange = now - this.lastQualityChangeTime;
      
      const isDowngrade = this.isQualityDowngrade(this.currentQuality, targetQuality);
      const requiredDelay = isDowngrade 
        ? DOWNGRADE_DELAY 
        : this.getUpgradeDelay(this.currentQuality, targetQuality);
      
      if (timeSinceLastChange >= requiredDelay) {
        this.changeQuality(targetQuality);
      }
    }
  }

  /**
   * Check if performance is critically low and recommend 2D fallback
   */
  private checkCriticalPerformance(fps: number): void {
    const now = performance.now();
    
    // Only check when at lowest quality (LOW)
    if (this.currentQuality !== QualityLevel.LOW) {
      this.criticalPerformanceStartTime = null;
      return;
    }
    
    if (fps < FPS_CRITICAL_THRESHOLD) {
      // Start tracking critical performance duration
      if (this.criticalPerformanceStartTime === null) {
        this.criticalPerformanceStartTime = now;
        console.warn(`[PerformanceMonitor] Critical performance detected: ${fps.toFixed(1)} FPS`);
      } else {
        // Check if we've been in critical state long enough
        const criticalDuration = now - this.criticalPerformanceStartTime;
        if (criticalDuration >= CRITICAL_DURATION && this.onCriticalPerformanceCallback) {
          console.error(`[PerformanceMonitor] Performance critically low for ${(criticalDuration / 1000).toFixed(1)}s, recommending 2D fallback`);
          this.onCriticalPerformanceCallback();
          // Reset to avoid repeated callbacks
          this.criticalPerformanceStartTime = null;
        }
      }
    } else {
      // Performance recovered
      if (this.criticalPerformanceStartTime !== null) {
        console.log(`[PerformanceMonitor] Performance recovered from critical state`);
      }
      this.criticalPerformanceStartTime = null;
    }
  }

  /**
   * Get required delay for quality upgrade based on transition
   */
  private getUpgradeDelay(current: QualityLevel, target: QualityLevel): number {
    // LOW → MEDIUM requires model swap, use shorter delay
    if (current === QualityLevel.LOW && target === QualityLevel.MEDIUM) {
      return UPGRADE_DELAY_LOW_TO_MEDIUM;
    }
    // MEDIUM → HIGH is just settings change, use longer delay to ensure stability
    if (current === QualityLevel.MEDIUM && target === QualityLevel.HIGH) {
      return UPGRADE_DELAY_MEDIUM_TO_HIGH;
    }
    return UPGRADE_DELAY_MEDIUM_TO_HIGH;
  }

  /**
   * Determine target quality based on FPS
   * LOW: < 20 FPS
   * MEDIUM: 20-35 FPS (loads 15MB model)
   * HIGH: > 50 FPS (same model, better settings)
   */
  private determineTargetQuality(fps: number): QualityLevel {
    if (fps < FPS_LOW_THRESHOLD) {
      return QualityLevel.LOW;
    } else if (fps < FPS_MEDIUM_THRESHOLD) {
      return QualityLevel.MEDIUM;
    } else if (fps < FPS_HIGH_THRESHOLD) {
      // Stay at MEDIUM if FPS is between MEDIUM and HIGH threshold
      // This prevents too aggressive upgrades
      return this.currentQuality === QualityLevel.HIGH ? QualityLevel.HIGH : QualityLevel.MEDIUM;
    } else {
      return QualityLevel.HIGH;
    }
  }

  /**
   * Check if quality change is a downgrade
   */
  private isQualityDowngrade(current: QualityLevel, target: QualityLevel): boolean {
    const qualityOrder = [QualityLevel.LOW, QualityLevel.MEDIUM, QualityLevel.HIGH];
    return qualityOrder.indexOf(target) < qualityOrder.indexOf(current);
  }

  /**
   * Change quality level
   */
  private changeQuality(newQuality: QualityLevel): void {
    if (newQuality === this.currentQuality) return;
    
    console.log(`[PerformanceMonitor] Quality change: ${this.currentQuality} -> ${newQuality}`);
    this.currentQuality = newQuality;
    this.lastQualityChangeTime = performance.now();
    
    // Reset frame times to get fresh data for new quality level
    this.frameTimes = [];
    
    // Notify callback
    if (this.onQualityChangeCallback) {
      this.onQualityChangeCallback(newQuality);
    }
  }

  /**
   * Reset the monitor
   */
  public reset(): void {
    this.frameTimes = [];
    this.frameCount = 0;
    this.lastFrameTime = performance.now();
  }

  /**
   * Cleanup
   */
  public dispose(): void {
    if (this.stabilityTimer !== null) {
      clearTimeout(this.stabilityTimer);
      this.stabilityTimer = null;
    }
    this.onQualityChangeCallback = undefined;
    this.frameTimes = [];
  }
}

