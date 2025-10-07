import { useEffect, useRef, useState } from 'react';
import type { ConnectionLine } from '../components/ConnectionOverlay';

export interface ConnectionLineSelectors {
  taskContainerSelector: string;
  taskRowSelector: string;
  taskTargetSelector: string;
  answerContainerSelector: string;
  answerRowSelectorTemplate: string;
}

export interface ConnectionLineCoordinateConfig {
  taskCoordinates: {
    x: 'left' | 'right' | 'center';
    y: 'top' | 'bottom' | 'center';
  };
  answerCoordinates: {
    x: 'left' | 'right' | 'center';
    y: 'top' | 'bottom' | 'center';
  };
}

export const CONNECTION_LINE_PRESETS = {
  NUMBER_SYSTEM: {
    selectors: {
      taskContainerSelector: '.equations-section',
      taskRowSelector: '.equation-row',
      taskTargetSelector: '.result-placeholder',
      answerContainerSelector: '.results-section',
      answerRowSelectorTemplate: '.result-row.row-{index}'
    },
    coordinateConfig: {
      taskCoordinates: { x: 'right', y: 'center' },
      answerCoordinates: { x: 'left', y: 'center' }
    }
  },
  LEFT_TO_RIGHT: {
    selectors: {
      taskContainerSelector: '.task-container',
      taskRowSelector: '.task-item',
      taskTargetSelector: '.target',
      answerContainerSelector: '.answer-container',
      answerRowSelectorTemplate: '.answer-item.item-{index}'
    },
    coordinateConfig: {
      taskCoordinates: { x: 'right', y: 'center' },
      answerCoordinates: { x: 'left', y: 'center' }
    }
  }
} as const;

export interface ConnectionLineCalculationProps<T, A> {
  tasks: T[];
  assignments: Record<string, A | null>;
  answerPool: A[];
  containerRef: React.RefObject<HTMLDivElement>;
  getTaskId: (task: T) => string;
  compareAnswers: (assignment: A, poolAnswer: A) => boolean;
  selectors: ConnectionLineSelectors;
  coordinateConfig?: ConnectionLineCoordinateConfig;
  debug?: boolean;
}

export function useConnectionLines<T, A>({
  tasks,
  assignments,
  answerPool,
  containerRef,
  getTaskId,
  compareAnswers,
  selectors,
  coordinateConfig = {
    taskCoordinates: { x: 'right', y: 'center' },
    answerCoordinates: { x: 'left', y: 'center' }
  },
  debug = false
}: ConnectionLineCalculationProps<T, A>) {
  const [connectionLines, setConnectionLines] = useState<ConnectionLine[]>([]);
  const timeoutsRef = useRef<number[]>([]);

  const calculateCoordinates = (
    element: Element,
    containerRect: DOMRect,
    config: { x: 'left' | 'right' | 'center'; y: 'top' | 'bottom' | 'center' }
  ) => {
    const rect = element.getBoundingClientRect();
    
    let x: number;
    switch (config.x) {
      case 'left':
        x = rect.left - containerRect.left;
        break;
      case 'right':
        x = rect.right - containerRect.left;
        break;
      case 'center':
        x = rect.left + rect.width / 2 - containerRect.left;
        break;
    }
    
    let y: number;
    switch (config.y) {
      case 'top':
        y = rect.top - containerRect.top;
        break;
      case 'bottom':
        y = rect.bottom - containerRect.top;
        break;
      case 'center':
        y = rect.top + rect.height / 2 - containerRect.top;
        break;
    }
    
    return { x, y };
  };

  useEffect(() => {
    const shallowEqualLines = (a: ConnectionLine[], b: ConnectionLine[]) => {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        const x = a[i], y = b[i];
        if (
          x.fromX !== y.fromX || x.fromY !== y.fromY ||
          x.toX !== y.toX || x.toY !== y.toY ||
          x.taskId !== y.taskId || x.answerIndex !== y.answerIndex
        ) return false;
      }
      return true;
    };

    const calculateConnectionLines = () => {
      if (!containerRef.current) {
        return;
      }
      
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      
      const lines: ConnectionLine[] = [];
      
      tasks.forEach((task, taskIndex) => {
        const taskId = getTaskId(task);
        const assignment = assignments[taskId];
        if (!assignment) return;
        
        const taskRow = container.querySelector(`${selectors.taskContainerSelector} ${selectors.taskRowSelector}:nth-child(${taskIndex + 1})`);
        if (!taskRow) return;
        
        const taskTarget = taskRow.querySelector(selectors.taskTargetSelector);
        if (!taskTarget) return;
        
        const answerIndex = answerPool.findIndex(poolAnswer => 
          compareAnswers(assignment, poolAnswer)
        );
        if (answerIndex === -1) return;
        
        const answerRowSelector = selectors.answerRowSelectorTemplate.replace('{index}', answerIndex.toString());
        const answerRow = container.querySelector(`${selectors.answerContainerSelector} ${answerRowSelector}`);
        if (!answerRow) return;
        
        const fromCoords = calculateCoordinates(taskTarget, containerRect, coordinateConfig.taskCoordinates);
        const toCoords = calculateCoordinates(answerRow, containerRect, coordinateConfig.answerCoordinates);
        
        lines.push({
          fromX: fromCoords.x,
          fromY: fromCoords.y,
          toX: toCoords.x,
          toY: toCoords.y,
          taskId,
          answerIndex
        });
      });
      
      // Only update state if lines actually changed to prevent render loops
      setConnectionLines(prev => (shallowEqualLines(prev, lines) ? prev : lines));
    };

    const calculateWithRetry = () => {
      calculateConnectionLines();
      
      const timeouts = [50, 100, 200, 500];
      // Clear previous pending timeouts
      timeoutsRef.current.forEach(id => clearTimeout(id));
      timeoutsRef.current = [];
      timeouts.forEach(delay => {
        const id = window.setTimeout(calculateConnectionLines, delay);
        timeoutsRef.current.push(id);
      });
    };

    const handleResize = () => {
      setTimeout(calculateConnectionLines, 100);
    };

    window.addEventListener('resize', handleResize);
    
    calculateWithRetry();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      // Cleanup pending timeouts
      timeoutsRef.current.forEach(id => clearTimeout(id));
      timeoutsRef.current = [];
    };
  }, [tasks, assignments, answerPool, containerRef, getTaskId, compareAnswers, selectors, coordinateConfig, debug]);

  return connectionLines;
}
