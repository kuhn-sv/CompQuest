import React from 'react';
import './Timer.component.scss';

interface TimerProps {
  time: number;
  isRunning: boolean;
  formatTime: (time: number) => string;
  className?: string;
}

const Timer: React.FC<TimerProps> = ({ 
  time, 
  isRunning, 
  formatTime, 
  className = '' 
}) => {
  return (
    <div className={`timer ${className} ${isRunning ? 'running' : 'stopped'}`}>
      <div className="timer__icon">
        ⏱️
      </div>
      <div className="timer__display">
        {formatTime(time)}
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

export default Timer;