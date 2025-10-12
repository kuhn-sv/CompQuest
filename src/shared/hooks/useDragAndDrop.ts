import { useState, useCallback, useRef } from 'react';

export interface DragDropItem {
  value: string;
  base: number;
}

export interface DragDropSelectors {
  /** Selector for draggable elements that need visual feedback during drag */
  draggableElementSelector: string;
}

export interface DragDropConfig<T extends DragDropItem> {
  /** CSS selectors for finding DOM elements */
  selectors: DragDropSelectors;
  /** Enable visual feedback during drag operations */
  enableVisualFeedback?: boolean;
  /** Optional callback used when a pointer/touch based drop is detected. The hook will call this with (targetId, item) */
  onPointerDrop?: (targetId: string, item: T) => void;
}

// Preset configurations for common use cases
export const DRAG_DROP_PRESETS = {
  /** Standard configuration for NumberSystem component */
  NUMBER_SYSTEM: {
    selectors: {
      draggableElementSelector: '.input-field.result-field'
    },
    enableVisualFeedback: true
  },
  /** Generic configuration for any draggable elements */
  GENERIC: {
    selectors: {
      draggableElementSelector: '.draggable-item'
    },
    enableVisualFeedback: true
  }
} as const;

export interface DragDropHandlers<T extends DragDropItem> {
  draggedItem: T | null;
  dragOverTargetId: string | null;
  handleDragStart: (e: React.DragEvent, item: T) => void;
  handleDragOver: (e: React.DragEvent, targetId: string) => void;
  handleDragEnter: (e: React.DragEvent, targetId: string) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, targetId: string, onDrop: (targetId: string, item: T) => void) => void;
  handleDragEnd: () => void;
  resetDragState: () => void;
  // Pointer/touch friendly handlers (optional; for touch devices)
  handlePointerDown?: (e: React.PointerEvent | React.TouchEvent, item: T) => void;
}

export function useDragAndDrop<T extends DragDropItem>(config: DragDropConfig<T>): DragDropHandlers<T> {
  const [draggedItem, setDraggedItem] = useState<T | null>(null);
  const [dragOverTargetId, setDragOverTargetId] = useState<string | null>(null);
  // Track whether pointer-based dragging is active
  const pointerActiveRef = useRef(false);
  const draggedElementRef = useRef<HTMLElement | null>(null);
  const draggedRowRef = useRef<HTMLElement | null>(null);

  // Helper to find nearest ancestor with data-task-id attribute
  const findTaskIdFromPoint = useCallback((clientX: number, clientY: number) => {
    const el = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
    if (!el) return null;
    const target = el.closest('[data-task-id]') as HTMLElement | null;
    return target ? (target.getAttribute('data-task-id') ?? null) : null;
  }, []);

  // Fallback hit-test: try sampling a few nearby points (useful on touch where the
  // finger is covering the dragged element). Returns the first task id found or null.
  const findTaskIdWithOffsets = useCallback((clientX: number, clientY: number) => {
    // Try the direct point first
    let tid = findTaskIdFromPoint(clientX, clientY);
    if (tid) return tid;

    // If direct hit didn't work, sample a few offsets to the left (and a couple other
    // directions) to attempt to reach the target under the finger.
    // Tunable offsets (pixels)
    const offsets = [ -80, -60, -40, -20, 20, 40 ];
    for (const ox of offsets) {
      try {
        tid = findTaskIdFromPoint(clientX + ox, clientY);
      } catch {}
      if (tid) return tid;
    }

    // As a last resort try a small vertical offset as well
    const vOffsets = [ -30, 30 ];
    for (const oy of vOffsets) {
      for (const ox of offsets) {
        try {
          tid = findTaskIdFromPoint(clientX + ox, clientY + oy);
        } catch {}
        if (tid) return tid;
      }
    }

    return null;
  }, [findTaskIdFromPoint]);

  const handleDragStart = useCallback((e: React.DragEvent, item: T) => {
    setDraggedItem(item);

    // If this is a genuine DragEvent with dataTransfer, use it; otherwise skip
    if (e && (e as unknown as { dataTransfer?: unknown }).dataTransfer) {
      try {
        e.dataTransfer.setData('text/plain', JSON.stringify(item));
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.dropEffect = 'move';
      } catch {
        // ignore malformed dataTransfer
      }
    }

    // Prevent event bubbling if available
    try {
      const maybeStop = (e as unknown as { stopPropagation?: () => void }).stopPropagation;
      if (typeof maybeStop === 'function') maybeStop.call(e);
    } catch {}
    
    // Add visual feedback immediately if enabled
    if (config.enableVisualFeedback) {
      setTimeout(() => {
        const element = e.target as HTMLElement;
        element.style.opacity = '0.5';
        element.style.transform = 'rotate(3deg)';
      }, 0);
    }
  }, [config.enableVisualFeedback]);

  // Pointer-based drag start (for touch/tablet)
  const handlePointerDown = useCallback((e: React.PointerEvent | React.TouchEvent, item: T) => {
    // We rely on CSS `touch-action: none` on draggable elements to prevent scrolling,
    // so avoid calling preventDefault here to prevent passive listener errors.
    setDraggedItem(item);
    pointerActiveRef.current = true;

    // For pointer events, try capturing the pointer so we keep receiving events
    try {
      const pe = e as React.PointerEvent<Element>;
      const pid = (pe as unknown as { pointerId?: number }).pointerId as number | undefined;
      if (typeof pid === 'number' && pe.currentTarget && typeof (pe.currentTarget as Element & { setPointerCapture?: (id: number) => void }).setPointerCapture === 'function') {
        try { (pe.currentTarget as Element & { setPointerCapture?: (id: number) => void }).setPointerCapture!(pid); } catch {}
      }
    } catch {}

    // Visual feedback
    const element = (e.currentTarget as HTMLElement) || null;
    if (config.enableVisualFeedback) {
      if (element) {
        element.style.opacity = '0.5';
        element.style.transform = 'rotate(3deg)';
      }
    }
    // Disable pointer-events on the dragged element and its result-row ancestor
    try {
      if (element) {
        draggedElementRef.current = element;
        (element as HTMLElement).style.pointerEvents = 'none';
        const row = element.closest('.result-row') as HTMLElement | null;
        if (row) {
          draggedRowRef.current = row;
          row.style.pointerEvents = 'none';
        }
      }
    } catch {}

    const onPointerMove = (ev: PointerEvent) => {
      // prefer an offset-aware hit-test for touch devices where the finger covers the dragged element
      const tid = findTaskIdWithOffsets(ev.clientX, ev.clientY);
      if (tid) setDragOverTargetId(tid);
      else setDragOverTargetId(null);
    };

    const onPointerUp = (ev: PointerEvent) => {
      pointerActiveRef.current = false;
      const tid = findTaskIdWithOffsets(ev.clientX, ev.clientY);
      try {
        if (tid && config.onPointerDrop) {
          config.onPointerDrop(tid, item);
        }
      } catch {
        // swallow errors silently to avoid noisy console output for users
      }
      // cleanup visual state
      if (config.enableVisualFeedback) {
        const els = document.querySelectorAll(config.selectors.draggableElementSelector);
        els.forEach(el => {
          (el as HTMLElement).style.opacity = '';
          (el as HTMLElement).style.transform = '';
          (el as HTMLElement).style.pointerEvents = '';
        });
      }
      // Restore pointer-events on row if we disabled it
      try {
        if (draggedRowRef.current) {
          draggedRowRef.current.style.pointerEvents = '';
          draggedRowRef.current = null;
        }
        if (draggedElementRef.current) {
          draggedElementRef.current.style.pointerEvents = '';
          draggedElementRef.current = null;
        }
      } catch {}
      setDraggedItem(null);
      setDragOverTargetId(null);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('touchmove', onTouchMove as EventListener);
      window.removeEventListener('touchend', onTouchEnd as EventListener);
      window.removeEventListener('touchcancel', onTouchEnd as EventListener);
    };

    const onTouchMove = (tev: TouchEvent) => {
      const t = tev.touches && tev.touches[0];
      if (!t) return;
      const tid = findTaskIdWithOffsets(t.clientX, t.clientY);
      if (tid) setDragOverTargetId(tid);
      else setDragOverTargetId(null);
    };

    const onTouchEnd = (tev: TouchEvent) => {
      pointerActiveRef.current = false;
      const t = (tev.changedTouches && tev.changedTouches[0]) || (tev.touches && tev.touches[0]);
      const clientX = t ? t.clientX : 0;
      const clientY = t ? t.clientY : 0;
      const tid = findTaskIdWithOffsets(clientX, clientY);
      try {
        if (tid && config.onPointerDrop) {
          config.onPointerDrop(tid, item);
        }
      } catch {
        // swallow errors silently
      }
      // cleanup visual state
      if (config.enableVisualFeedback) {
        const els = document.querySelectorAll(config.selectors.draggableElementSelector);
        els.forEach(el => {
          (el as HTMLElement).style.opacity = '';
          (el as HTMLElement).style.transform = '';
          (el as HTMLElement).style.pointerEvents = '';
        });
      }
      // Restore pointer-events on row if we disabled it
      try {
        if (draggedRowRef.current) {
          draggedRowRef.current.style.pointerEvents = '';
          draggedRowRef.current = null;
        }
        if (draggedElementRef.current) {
          draggedElementRef.current.style.pointerEvents = '';
          draggedElementRef.current = null;
        }
      } catch {}
      setDraggedItem(null);
      setDragOverTargetId(null);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('touchmove', onTouchMove as EventListener);
      window.removeEventListener('touchend', onTouchEnd as EventListener);
      window.removeEventListener('touchcancel', onTouchEnd as EventListener);
    };

    // Register both pointer and touch listeners to cover different browsers/devices
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    // Register touch listeners as passive to avoid browser warnings; we don't need to call preventDefault here
    window.addEventListener('touchmove', onTouchMove as EventListener, { passive: true });
    window.addEventListener('touchend', onTouchEnd as EventListener);
    window.addEventListener('touchcancel', onTouchEnd as EventListener);
  }, [config, findTaskIdWithOffsets]);

  const handleDragOver = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverTargetId(targetId);
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverTargetId(targetId);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    // Only clear if we're leaving the target entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverTargetId(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetId: string, onDrop: (targetId: string, item: T) => void) => {
    e.preventDefault();
    
    try {
      const itemData = e.dataTransfer.getData('text/plain');
      
      if (itemData) {
        const item: T = JSON.parse(itemData);
        onDrop(targetId, item);
      }
    } catch (error) {
      console.error('Error parsing dropped data:', error);
    }
    
    setDraggedItem(null);
    setDragOverTargetId(null);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
    setDragOverTargetId(null);
    
    // Reset visual styling if enabled
    if (config.enableVisualFeedback) {
      const draggedElements = document.querySelectorAll(config.selectors.draggableElementSelector);
      draggedElements.forEach(el => {
        (el as HTMLElement).style.opacity = '';
        (el as HTMLElement).style.transform = '';
      });
    }
  }, [config.selectors.draggableElementSelector, config.enableVisualFeedback]);

  const resetDragState = useCallback(() => {
    setDraggedItem(null);
    setDragOverTargetId(null);
  }, []);

  return {
    draggedItem,
    dragOverTargetId,
    handleDragStart,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
    resetDragState
    , handlePointerDown
  };
}