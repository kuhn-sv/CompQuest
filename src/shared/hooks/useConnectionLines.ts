import { useEffect, useState } from 'react';
import type { ConnectionLine } from '../components/ConnectionOverlay';

export interface ConnectionLineCalculationProps<T, A> {
  tasks: T[];
  assignments: Record<string, A | null>;
  answerPool: A[];
  containerRef: React.RefObject<HTMLDivElement>;
  getTaskId: (task: T) => string;
  compareAnswers: (assignment: A, poolAnswer: A) => boolean;
  debug?: boolean;
}

export function useConnectionLines<T, A>({
  tasks,
  assignments,
  answerPool,
  containerRef,
  getTaskId,
  compareAnswers,
  debug = false
}: ConnectionLineCalculationProps<T, A>) {
  const [connectionLines, setConnectionLines] = useState<ConnectionLine[]>([]);

  useEffect(() => {
    const calculateConnectionLines = () => {
      if (!containerRef.current) {
        if (debug) console.log('No container ref');
        return;
      }
      
      const lines: ConnectionLine[] = [];
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      
      if (debug) console.log('Calculating connection lines, assignments:', assignments);
      
      // Find all assigned results
      tasks.forEach((task, taskIndex) => {
        const taskId = getTaskId(task);
        const assignment = assignments[taskId];
        if (debug) console.log(`Task ${taskIndex}:`, taskId, 'assignment:', assignment);
        if (!assignment) return;
        
        // Find the equation row element
        const equationRow = container.querySelector(`.equation-row:nth-child(${taskIndex + 1})`);
        if (debug) console.log('Found equation row:', equationRow);
        if (!equationRow) return;
        
        // Find the result placeholder in that row
        const resultPlaceholder = equationRow.querySelector('.result-placeholder');
        if (debug) console.log('Found result placeholder:', resultPlaceholder);
        if (!resultPlaceholder) return;
        
        // Find the original answer position in results section
        const answerIndex = answerPool.findIndex(poolAnswer => 
          compareAnswers(assignment, poolAnswer)
        );
        if (debug) console.log('Answer index:', answerIndex);
        if (answerIndex === -1) return;
        
        const resultRow = container.querySelector(`.results-section .result-row.row-${answerIndex}`);
        if (debug) console.log('Found result row:', resultRow);
        if (!resultRow) return;
        
        // Calculate coordinates
        const placeholderRect = resultPlaceholder.getBoundingClientRect();
        const resultRowRect = resultRow.getBoundingClientRect();
        
        // Start from the right edge of the result placeholder (end of connector line)
        const fromX = placeholderRect.right - containerRect.left;
        const fromY = placeholderRect.top + placeholderRect.height / 2 - containerRect.top;
        
        // End at the left edge of the result row (where the connector line segment appears)
        const toX = resultRowRect.left - containerRect.left;
        const toY = resultRowRect.top + resultRowRect.height / 2 - containerRect.top;
        
        if (debug) console.log('Line coordinates:', { fromX, fromY, toX, toY });
        
        lines.push({
          fromX,
          fromY,
          toX,
          toY,
          taskId,
          answerIndex
        });
      });
      
      if (debug) console.log('Final connection lines:', lines);
      setConnectionLines(lines);
    };
    
    // Delay calculation to ensure DOM is updated
    const timeoutId = setTimeout(calculateConnectionLines, 100);
    return () => clearTimeout(timeoutId);
  }, [tasks, assignments, answerPool, containerRef, getTaskId, compareAnswers, debug]);

  return connectionLines;
}