import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTimerReturn {
  // Accumulated time in ms when not running; during running it's the last persisted value
  time: number;
  isRunning: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
  // Live elapsed accessor (uses start time + accumulated offset)
  getElapsed: () => number;
  // Formats milliseconds to MM:SS
  formatTime: (timeInMs: number) => string;
}

export const useTimer = (): UseTimerReturn => {
  const [time, setTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  // Monotonic timestamp when the current run started (performance.now)
  const startPerfRef = useRef<number>(0);

  // Mirror state into refs so getElapsed can read the *latest* values
  // synchronously — even within the same event handler that called stop().
  const isRunningRef = useRef<boolean>(false);
  const timeRef = useRef<number>(0);

  // No interval needed; we compute live time via getElapsed
  useEffect(() => {
    return () => {
      // nothing to cleanup
    };
  }, []);

  const start = () => {
    if (isRunningRef.current) return;
    // Continue from paused time
    startPerfRef.current = performance.now();
    isRunningRef.current = true;
    setIsRunning(true);
  };

  const stop = () => {
    if (!isRunningRef.current) return;
    // Persist the elapsed time
    const elapsed = timeRef.current + (performance.now() - startPerfRef.current);
    timeRef.current = elapsed;
    isRunningRef.current = false;
    setTime(elapsed);
    setIsRunning(false);
  };

  const reset = () => {
    timeRef.current = 0;
    isRunningRef.current = false;
    setTime(0);
    setIsRunning(false);
    startPerfRef.current = performance.now();
  };

  const getElapsed = useCallback(() => {
    return isRunningRef.current
      ? (timeRef.current + (performance.now() - startPerfRef.current))
      : timeRef.current;
  }, []);

  const formatTime = useCallback((timeInMs: number): string => {
    const totalSeconds = Math.floor(timeInMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  return {
    time,
    isRunning,
    start,
    stop,
    reset,
    getElapsed,
    formatTime
  };
};