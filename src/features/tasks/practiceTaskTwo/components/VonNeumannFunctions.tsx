import React, {useCallback, useEffect, useRef, useState} from 'react';
import './VonNeumannFunctions.scss';
import {
  ConnectionOverlay,
  ConnectionLine,
} from '../../../../shared/components/ConnectionOverlay/ConnectionOverlay.component';
import type {TaskStageScore} from '../../../../shared/interfaces/tasking.interfaces';

interface PairItem {
  id: string;
  label: string;
}

interface Props {
  left: PairItem[];
  right: PairItem[];
  onChange?: (score: TaskStageScore | null) => void;
  evaluated?: boolean;
}

const VonNeumannFunctions: React.FC<Props> = ({
  left,
  right,
  onChange,
  evaluated,
}) => {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [pairs, setPairs] = useState<Record<string, string>>({});
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Utility to compute edge coords of an item by id
  // Left items: use right edge, Right items: use left edge
  const getCenter = useCallback((side: 'left' | 'right', id: string) => {
    const root = containerRef.current;
    if (!root) return null;
    const selector = `[data-side="${side}"][data-id="${id}"]`;
    const el = root.querySelector(selector) as HTMLElement | null;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const parentRect = root.getBoundingClientRect();

    // For left items, use the right edge; for right items, use the left edge
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

  // Whenever pairs or evaluated flag change, update overlay lines and report score
  useEffect(() => {
    setLines(buildLines());
    // Correct if paired right id equals left id
    const correctMatches = Object.entries(pairs).filter(
      ([l, r]) => r === l,
    ).length;
    const score: TaskStageScore = {
      difficulty: 'Zuordnung',
      correct: correctMatches,
      total: left.length,
      points: correctMatches,
    };
    onChange?.(score);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pairs, left.length, evaluated]);

  // update lines on resize (positions may change)
  useEffect(() => {
    const onRes = () => setLines(buildLines());
    window.addEventListener('resize', onRes);
    return () => window.removeEventListener('resize', onRes);
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
      // select right as a single click (allow selecting right first)
      setSelectedRight(prev => (prev === id ? null : id));
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
    setSelectedRight(null);
  };

  // allow completing a pair by clicking right after selecting right first
  useEffect(() => {
    if (selectedRight && !selectedLeft) {
      // If a right is selected and left clicks later will pair with it,
      // we keep the UX simple: wait for left selection.
    }
  }, [selectedLeft, selectedRight]);

  return (
    <div className="vn-functions" ref={containerRef}>
      <div className="vn-functions__cols">
        <div className="vn-functions__col vn-functions__col--left">
          {left.map(item => {
            const pairedRight = pairs[item.id];
            const isCorrect = evaluated && pairedRight === item.id;
            const isWrong = evaluated && pairedRight && pairedRight !== item.id;
            return (
              <div
                key={item.id}
                data-side="left"
                data-id={item.id}
                className={`vn-item vn-item--left ${selectedLeft === item.id ? 'is-selected' : ''} ${isCorrect ? 'is-correct' : ''} ${isWrong ? 'is-wrong' : ''}`}
                onClick={() => handleLeftClick(item.id)}>
                {item.label}
              </div>
            );
          })}
        </div>

        <div className="vn-functions__col vn-functions__col--right">
          {right.map(item => {
            const leftId = Object.entries(pairs).find(
              ([, r]) => r === item.id,
            )?.[0];
            const isCorrect = evaluated && leftId === item.id;
            const isWrong = evaluated && leftId && leftId !== item.id;
            return (
              <div
                key={item.id}
                data-side="right"
                data-id={item.id}
                className={`vn-item vn-item--right ${Object.values(pairs).includes(item.id) ? 'is-paired' : ''} ${isCorrect ? 'is-correct' : ''} ${isWrong ? 'is-wrong' : ''}`}
                onClick={() => handleRightClick(item.id)}>
                {item.label}
              </div>
            );
          })}
        </div>
      </div>

      <ConnectionOverlay connectionLines={lines} />
    </div>
  );
};

export default VonNeumannFunctions;
