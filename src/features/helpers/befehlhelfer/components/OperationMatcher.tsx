import React, {useCallback, useEffect, useRef, useState} from 'react';
import './OperationMatcher.scss';
import {
  ConnectionOverlay,
  ConnectionLine,
} from '../../../../shared/components/ConnectionOverlay/ConnectionOverlay.component';
import type {Operation} from '../types';

interface Props {
  operations: Operation[];
  evaluated?: boolean;
}

const OperationMatcher: React.FC<Props> = ({operations, evaluated}) => {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [pairs, setPairs] = useState<Record<string, string>>({});
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Reset pairs when operations change
  useEffect(() => {
    setPairs({});
    setSelectedLeft(null);
  }, [operations]);

  // Utility to compute edge coords of an item by id
  const getCenter = useCallback((side: 'left' | 'right', id: string) => {
    const root = containerRef.current;
    if (!root) return null;
    const selector = `[data-side="${side}"][data-id="${id}"]`;
    const el = root.querySelector(selector) as HTMLElement | null;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const parentRect = root.getBoundingClientRect();

    const x =
      side === 'left'
        ? rect.right - parentRect.left
        : rect.left - parentRect.left;
    const y = rect.top - parentRect.top + rect.height / 2;

    return {x, y};
  }, []);

  // Build connection lines for overlay
  const buildLines = (): ConnectionLine[] => {
    const lines: ConnectionLine[] = [];
    Object.entries(pairs).forEach(([l, r], idx) => {
      const from = getCenter('left', l);
      const to = getCenter('right', r);
      if (!from || !to) return;
      // IDs are preserved from original operations, so matching IDs = correct pair
      const status = evaluated ? (r === l ? 'correct' : 'wrong') : undefined;
      lines.push({
        fromX: from.x,
        fromY: from.y,
        toX: to.x,
        toY: to.y,
        taskId: l,
        answerIndex: idx,
        status,
      });
    });
    return lines;
  };

  const [lines, setLines] = useState<ConnectionLine[]>([]);

  // Update lines when pairs or evaluated changes
  useEffect(() => {
    setLines(buildLines());
    // buildLines uses getCenter which depends on DOM state, not suitable as dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pairs, evaluated]);

  // Update lines on resize
  useEffect(() => {
    const onRes = () => setLines(buildLines());
    window.addEventListener('resize', onRes);
    return () => window.removeEventListener('resize', onRes);
    // buildLines uses getCenter which depends on DOM state, not suitable as dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pairs]);

  const handleLeftClick = (id: string) => {
    setSelectedLeft(prev => (prev === id ? null : id));
    // if left already paired, unpair
    setPairs(prev => {
      if (prev[id]) {
        const copy = {...prev};
        delete copy[id];
        return copy;
      }
      return prev;
    });
  };

  const handleRightClick = (id: string) => {
    if (!selectedLeft) {
      return;
    }
    // Check if this right item is already paired with another left item
    setPairs(prev => {
      // Remove any existing pair using this right item
      const cleaned = Object.fromEntries(
        Object.entries(prev).filter(([, r]) => r !== id),
      );
      // Now pair selectedLeft with this right
      return {...cleaned, [selectedLeft]: id};
    });
    setSelectedLeft(null);
  };

  return (
    <div className="operation-matcher" ref={containerRef}>
      <div className="operation-matcher__cols">
        <div className="operation-matcher__col operation-matcher__col--left">
          {operations.map(op => {
            const pairedRight = pairs[op.id];
            const isCorrect = evaluated && pairedRight === op.id;
            const isWrong = evaluated && pairedRight && pairedRight !== op.id;
            return (
              <div
                key={op.id}
                data-side="left"
                data-id={op.id}
                className={`operation-item operation-item--left ${selectedLeft === op.id ? 'is-selected' : ''} ${isCorrect ? 'is-correct' : ''} ${isWrong ? 'is-wrong' : ''}`}
                onClick={() => handleLeftClick(op.id)}>
                {op.command}
              </div>
            );
          })}
        </div>

        <div className="operation-matcher__col operation-matcher__col--right">
          {operations.map(op => {
            const leftId = Object.entries(pairs).find(
              ([, r]) => r === op.id,
            )?.[0];
            const isCorrect = evaluated && leftId === op.id;
            const isWrong = evaluated && leftId && leftId !== op.id;
            return (
              <div
                key={op.id}
                data-side="right"
                data-id={op.id}
                className={`operation-item operation-item--right ${Object.values(pairs).includes(op.id) ? 'is-paired' : ''} ${isCorrect ? 'is-correct' : ''} ${isWrong ? 'is-wrong' : ''}`}
                onClick={() => handleRightClick(op.id)}>
                {op.description}
              </div>
            );
          })}
        </div>
      </div>

      <ConnectionOverlay connectionLines={lines} />
    </div>
  );
};

export default OperationMatcher;
