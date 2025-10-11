import React, { useEffect, useMemo, useRef, useState } from 'react';

interface DigitSelectProps {
  value: number;
  onChange: (value: number) => void;
  base: 8 | 16;
  disabled?: boolean;
}

const DigitSelect: React.FC<DigitSelectProps> = ({ value, onChange, base, disabled }) => {
  const options = useMemo(() => {
    const n = base === 8 ? 8 : 16;
    return Array.from({ length: n }, (_, v) => ({
      value: v,
      label: base === 16 && v >= 10 ? String.fromCharCode(55 + v) : String(v),
    }));
  }, [base]);

  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const currentIndex = options.findIndex(o => o.value === value);

  const toggleOpen = () => {
    if (disabled) return;
    setOpen(o => !o);
  };

  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        close();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const onKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleOpen();
    }
    if (!open) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const delta = e.key === 'ArrowDown' ? 1 : -1;
      const next = (currentIndex + delta + options.length) % options.length;
      onChange(options[next].value);
    }
  };

  return (
    <div className="digit-select" ref={wrapperRef}>
      <button
        type="button"
        className="digit-select__button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={base === 8 ? 'Oktalziffer' : 'Hexziffer'}
        onClick={toggleOpen}
        onKeyDown={onKeyDown}
        disabled={disabled}
      >
        <span className="digit-select__value">{options[currentIndex]?.label ?? value}</span>
        <span className="digit-select__chevron" aria-hidden>▾</span>
      </button>
      {open && (
        <ul className="digit-select__menu" role="listbox" aria-label={base === 8 ? 'Oktalziffern' : 'Hexziffern'}>
          {options.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              className={`digit-select__option ${opt.value === value ? 'selected' : ''}`}
              onMouseDown={(e) => {
                // use mousedown to pick before focus/blur closes
                e.preventDefault();
                onChange(opt.value);
                close();
              }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DigitSelect;
