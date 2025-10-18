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

// Items for quiz rounds
export const QUIZ_ITEMS = [
  {id: 'cpu', label: 'CPU (Central Processing Unit)', isCore: true},
  {id: 'power-supply', label: 'Netzteil', isCore: false},
  {id: 'ram', label: 'RAM (Random Access Memory)', isCore: true},
  {id: 'control', label: 'Steuerwerk (Control Unit)', isCore: true},
  {id: 'alu', label: 'ALU (Arithmetic Logic Unit)', isCore: true},
  {id: 'gpu', label: 'Grafikprozessor (Graphics Processing Unit)', isCore: false},
  {id: 'cache', label: 'Cache-Speicher', isCore: false},
  {id: 'peripherie', label: 'Peripherie', isCore: true},
  {id: 'rom', label: 'ROM (Read-Only Memory)', isCore: true},
  {id: 'bus', label: 'BUS', isCore: true},
];

// Components for reconstruct round
export const RECONSTRUCT_COMPONENTS = [
  'Steuerwerk',
  'Rechenwerk',
  'Transportmedium',
  'RAM',
  'ROM',
  'Peripherie',
];

// Buses for bus assignment round
export const BUS_COMPONENTS = [
  'Datenbus',
  'Adressbus',
  'Steuerbus',
];

// Function pairs data
const ID_TO_LABEL: Record<string, string> = {
  cpu: 'CPU',
  ram: 'RAM',
  peripherie: 'Peripherie',
  bus: 'BUS',
  alu: 'Rechenwerk',
  control: 'Steuerwerk',
  rom: 'ROM',
};

const ID_TO_DESC: Record<string, string> = {
  cpu: 'Leitet Befehle, steuert Abläufe und koordiniert alle Systemteile.',
  ram: 'Speichert veränderbare Daten und Programme vorübergehend.',
  peripherie: 'Ermöglicht Eingabe, Ausgabe und externe Datenspeicherung.',
  bus: 'Überträgt Daten und Steuerinformationen zwischen Systemeinheiten.',
  alu: 'Führt logische und mathematische Operationen aus.',
  control: 'Bestimmt die Reihenfolge und Steuerung der Befehlsausführung.',
  rom: 'Beinhaltet dauerhaft gespeicherte Start- und Basisinformationen.',
};

function generateFunctionPairs() {
  const poolIds = ['cpu', 'ram', 'peripherie', 'bus', 'alu', 'control', 'rom'];
  const shuffledIds = [...poolIds];
  for (let i = shuffledIds.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledIds[i], shuffledIds[j]] = [shuffledIds[j], shuffledIds[i]];
  }
  const chosenIds = shuffledIds.slice(0, 4);
  const leftItems = chosenIds.map(id => ({id, label: ID_TO_LABEL[id]}));
  const rightItems = chosenIds.map(id => ({id, label: ID_TO_DESC[id]}));
  
  // Shuffle right items
  for (let i = rightItems.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rightItems[i], rightItems[j]] = [rightItems[j], rightItems[i]];
  }
  
  return {left: leftItems, right: rightItems};
}

export const generateRounds = (count: number): VonNeumannRound[] => {
  const rounds: VonNeumannRound[] = [];
  
  for (let i = 0; i < count; i++) {
    // Third round (index 2) is the reconstruct task
    if (i === 2) {
      rounds.push({
        id: 'vonneumann-reconstruct-3',
        type: 'reconstruct',
        components: RECONSTRUCT_COMPONENTS,
      });
    } 
    // Fourth round (index 3) is the bus assignment task
    else if (i === 3) {
      rounds.push({
        id: 'vonneumann-bus-4',
        type: 'busAssignment',
        buses: BUS_COMPONENTS,
      });
    } 
    else {
      // Alternate between quiz and functions for other rounds
      const type: RoundType = i % 2 === 0 ? 'quiz' : 'functions';
      
      if (type === 'quiz') {
        rounds.push({
          id: `vonneumann-quiz-${i + 1}`,
          type: 'quiz',
          items: QUIZ_ITEMS,
        });
      } else {
        rounds.push({
          id: `vonneumann-functions-${i + 1}`,
          type: 'functions',
          functionPairs: generateFunctionPairs(),
        });
      }
    }
  }
  
  return rounds;
};
