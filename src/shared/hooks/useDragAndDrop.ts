import { useState, useCallback } from 'react';

export interface DragDropItem {
  value: string;
  base: number;
}

export interface DragDropSelectors {
  /** Selector for draggable elements that need visual feedback during drag */
  draggableElementSelector: string;
}

export interface DragDropConfig {
  /** CSS selectors for finding DOM elements */
  selectors: DragDropSelectors;
  /** Enable visual feedback during drag operations */
  enableVisualFeedback?: boolean;
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
}

export function useDragAndDrop<T extends DragDropItem>(config: DragDropConfig): DragDropHandlers<T> {
  const [draggedItem, setDraggedItem] = useState<T | null>(null);
  const [dragOverTargetId, setDragOverTargetId] = useState<string | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, item: T) => {
    setDraggedItem(item);
    
    // Set data transfer
    e.dataTransfer.setData('text/plain', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'move';
    
    // Force enable dragging
    e.dataTransfer.dropEffect = 'move';
    
    // Prevent event bubbling
    e.stopPropagation();
    
    // Add visual feedback immediately if enabled
    if (config.enableVisualFeedback) {
      setTimeout(() => {
        const element = e.target as HTMLElement;
        element.style.opacity = '0.5';
        element.style.transform = 'rotate(3deg)';
      }, 0);
    }
  }, [config.enableVisualFeedback]);

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
  };
}