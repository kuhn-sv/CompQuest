export type RoundType = 'quiz' | 'functions' | 'reconstruct' | 'busAssignment';

export interface VonNeumannRound {
  id: string;
  type: RoundType;
  // For quiz rounds:
  items?: {id: string; label: string; isCore: boolean}[];
  // For functions rounds:
  functionPairs?: {
    left: {id: string; label: string}[];
    right: {id: string; label: string}[];
  };
  // For reconstruct rounds:
  components?: string[];
  // For bus assignment rounds:
  buses?: string[];
}

// Common type for drag-and-drop placements
export interface Placements {
  [dropZoneId: string]: string | null;
}
