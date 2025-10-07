import React, { useEffect, useRef } from 'react';
import './Timer.component.scss';

interface TimerProps {
  time: number; // accumulated time (used when not running)
  isRunning: boolean;
  formatTime: (time: number) => string;
  className?: string;
  // Optional live accessor for smooth updates
  getElapsed?: () => number;
}

const Timer: React.FC<TimerProps> = ({ 
  time,
  isRunning,
  formatTime,
  className = '',
  getElapsed
}) => {
  const rafRef = useRef<number | null>(null);
  const displayRef = useRef<HTMLDivElement | null>(null);

  // Sync display when props change and timer is not running
  useEffect(() => {
    if (!isRunning && displayRef.current) {
      displayRef.current.textContent = formatTime(time);
    }
  }, [time, isRunning, formatTime]);

  useEffect(() => {
    if (!isRunning) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const tick = () => {
      const elapsed = getElapsed ? getElapsed() : time;
      if (displayRef.current) {
        displayRef.current.textContent = formatTime(elapsed);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [isRunning, getElapsed, time, formatTime]);

  return (
    <div className={`timer ${className} ${isRunning ? 'running' : 'stopped'}`}>
      <div className="timer__icon">
        ⏱️
      </div>
      <div className="timer__display">
        <span ref={displayRef}>{formatTime(time)}</span>
      </div>
      <div className="timer__status">
        {isRunning ? (
          <span className="timer__status--running">●</span>
        ) : (
          <span className="timer__status--stopped">⏸</span>
        )}
      </div>
    </div>
  );
};

export default React.memo(Timer);