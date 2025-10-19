import { QualityLevel, PerformanceMetrics } from '../../interfaces/performance.types';

const FPS_SAMPLE_SIZE = 60; // Track last 60 frames
const UPGRADE_DELAY = 3000; // 3 seconds stable before upgrade
const DOWNGRADE_DELAY = 1000; // 1 second before downgrade
const FPS_LOW_THRESHOLD = 25;
const FPS_MEDIUM_THRESHOLD = 45;

export class PerformanceMonitor {
  private frameTimes: number[] = [];
  private lastFrameTime: number = performance.now();
  private frameCount: number = 0;
  private currentQuality: QualityLevel = QualityLevel.HIGH;
  private lastQualityChangeTime: number = performance.now();
  private stabilityTimer: number | null = null;
  private onQualityChangeCallback?: (quality: QualityLevel) => void;

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
    const targetQuality = this.determineTargetQuality(avgFPS);
    
    // If target quality is different, check if enough time has passed
    if (targetQuality !== this.currentQuality) {
      const now = performance.now();
      const timeSinceLastChange = now - this.lastQualityChangeTime;
      
      const isDowngrade = this.isQualityDowngrade(this.currentQuality, targetQuality);
      const requiredDelay = isDowngrade ? DOWNGRADE_DELAY : UPGRADE_DELAY;
      
      if (timeSinceLastChange >= requiredDelay) {
        this.changeQuality(targetQuality);
      }
    }
  }

  /**
   * Determine target quality based on FPS
   */
  private determineTargetQuality(fps: number): QualityLevel {
    if (fps < FPS_LOW_THRESHOLD) {
      return QualityLevel.LOW;
    } else if (fps < FPS_MEDIUM_THRESHOLD) {
      return QualityLevel.MEDIUM;
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

