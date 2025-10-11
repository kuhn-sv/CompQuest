import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { SubTaskComponentProps } from '../../../shared/interfaces/tasking.interfaces';
import './Umrechnungshelfer.scss';

type ModeTab = 'binhex' | 'binoct' | 'octhex';

const BITS = 8;

const toBits = (n: number, width = BITS) =>
  Array.from({ length: width }, (_, i) => (n >> (width - 1 - i)) & 1);

const bitsToDecimal = (bits: number[]) =>
  bits.reduce((sum, b, idx) => sum + b * (1 << (bits.length - 1 - idx)), 0);

const decimalToHex = (n: number) => n.toString(16).toUpperCase();

const Umrechnungshelfer: React.FC<SubTaskComponentProps> = ({ onControlsChange, onHudChange }) => {
  const [tab, setTab] = useState<ModeTab>('binhex');
  // targetDec optional for future steps; for now we derive expectedDec from bits
  const [targetBits, setTargetBits] = useState<number[]>(Array(BITS).fill(0));
  const [entries, setEntries] = useState<Array<0 | 1 | null>>(Array(BITS).fill(null));
  const [evaluated, setEvaluated] = useState(false);

  const expectedDec = useMemo(() => bitsToDecimal(targetBits), [targetBits]);
  const expectedHex = useMemo(() => decimalToHex(expectedDec), [expectedDec]);

  const newTask = useCallback(() => {
  const n = Math.floor(Math.random() * 256); // 0..255
    setTargetBits(toBits(n));
    setEntries(Array(BITS).fill(null));
    setEvaluated(false);
  }, []);

  // init and provide controls to container
  const initRef = useRef(false);
  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      newTask();
    }
  }, [newTask]);

  useEffect(() => {
    onHudChange?.({
      subtitle: 'Modus: Binär ↔ Hexadezimal',
      progress: null,
    });
    onControlsChange?.({
      onReset: () => newTask(),
      onEvaluate: () => setEvaluated(true),
      onNext: () => newTask(),
      showReset: true,
      showEvaluate: true,
      showNext: true,
    });
    return () => {
      onHudChange?.(null);
      onControlsChange?.(null);
    };
  }, [onControlsChange, onHudChange, newTask]);

  const setEntry = (idx: number, val: 0 | 1 | null) =>
    setEntries(prev => prev.map((v, i) => (i === idx ? val : v)));

  const renderBitRow = (idx: number) => {
    const correct = targetBits[BITS - 1 - idx]; // map 2^idx to LSB-right on targetBits
    const user = entries[BITS - 1 - idx];
    const isCorrect = evaluated ? user === correct : false;
    const hasValue = user !== null;
    const stateClass = evaluated && hasValue ? (isCorrect ? 'ok' : 'err') : '';
    return (
      <div key={idx} className={`uh-row ${stateClass}`}>
        <div className="uh-label">1×2^{idx} =</div>
        <div className="uh-input">
          <select
            aria-label={`Bit 2^${idx}`}
            value={user === null ? '' : user}
            onChange={(e) => {
              const v = e.target.value;
              setEntry(BITS - 1 - idx, v === '' ? null : (Number(v) as 0 | 1));
            }}
          >
            <option value="">-</option>
            <option value="0">0</option>
            <option value="1">1</option>
          </select>
        </div>
      </div>
    );
  };

  const binaryString = useMemo(() => targetBits.join(''), [targetBits]);

  return (
    <div className="umrechnungshelfer">
      <div className="tabs" role="tablist">
        <button className={`tab ${tab === 'binhex' ? 'active' : ''}`} role="tab" aria-selected={tab === 'binhex'} onClick={() => setTab('binhex')}>Binär ⇆ Hexadezimal</button>
        <button className={`tab ${tab === 'binoct' ? 'active' : ''}`} role="tab" aria-selected={tab === 'binoct'} disabled>Binär ⇆ Oktal</button>
        <button className={`tab ${tab === 'octhex' ? 'active' : ''}`} role="tab" aria-selected={tab === 'octhex'} disabled>Oktal ⇆ Hexadezimal</button>
      </div>

      {tab === 'binhex' && (
        <div className="uh-panel">
          <div className="uh-header">
            <div className="uh-section-title">
              <span className="badge">1</span> Binär → Dezimal
            </div>
            <div className="uh-target">{binaryString}<span className="uh-base">₂</span></div>
          </div>

          <div className="uh-grid">
            <div className="uh-col">
              {[0,1,2,3].map(i => renderBitRow(i))}
            </div>
            <div className="uh-col">
              {[4,5,6,7].map(i => renderBitRow(i))}
            </div>
          </div>

          <div className="uh-result">
            <div className="uh-result-label">Dezimal:</div>
            <div className="uh-result-value">{expectedDec}<span className="uh-base">₁₀</span></div>
          </div>
        </div>
      )}

      {tab === 'binhex' && (
        <div className="uh-panel">
          <div className="uh-section-title">
            <span className="badge">2</span> Dezimal → Hexadezimal
          </div>
          <div className="uh-result">
            <div className="uh-result-label">Hexadezimal:</div>
            <div className="uh-result-value">{expectedHex}<span className="uh-base">₁₆</span></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Umrechnungshelfer;
