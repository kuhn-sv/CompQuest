export interface AssemblyInstruction {
  addr: string;
  op: string;
  arg: string;
}

export interface AssemblyTask {
  id: string;
  variant: 1 | 2;
  question: string;
  program: AssemblyInstruction[];
  options: string[];
  correct_index: number;
  initial_values?: Record<string, number>;
}

// Complete task data
export const ASSEMBLY_TASKS: AssemblyTask[] = [
  {
    id: 'T1_add',
    variant: 1,
    question: 'Was macht dieses Programm?',
    program: [
      {addr: '0000', op: 'LDA', arg: '(13)'},
      {addr: '0001', op: 'ADD', arg: '(14)'},
      {addr: '0010', op: 'STA', arg: '15'},
      {addr: '0011', op: 'END', arg: ''},
    ],
    options: ['Subtraktion', 'Multiplikation', 'Addition', 'Division'],
    correct_index: 2,
  },
  {
    id: 'T2_sub',
    variant: 1,
    question: 'Was macht dieses Programm?',
    program: [
      {addr: '0000', op: 'LDA', arg: '(13)'},
      {addr: '0001', op: 'SUB', arg: '(14)'},
      {addr: '0010', op: 'STA', arg: '15'},
      {addr: '0011', op: 'END', arg: ''},
    ],
    options: ['Subtraktion', 'Addition', 'Division', 'Betrag'],
    correct_index: 0,
  },
  {
    id: 'T3_mul',
    variant: 1,
    question: 'Was macht dieses Programm?',
    program: [
      {addr: '0000', op: 'LDA', arg: '(13)'},
      {addr: '0001', op: 'ADD', arg: '(13)'},
      {addr: '0010', op: 'STA', arg: '15'},
      {addr: '0011', op: 'END', arg: ''},
    ],
    options: ['Multiplikation', 'Addition', 'Maximum', 'Subtraktion'],
    correct_index: 0,
  },
  {
    id: 'T4_copy',
    variant: 1,
    question: 'Was macht dieses Programm?',
    program: [
      {addr: '0000', op: 'LDA', arg: '(13)'},
      {addr: '0001', op: 'STA', arg: '15'},
      {addr: '0010', op: 'END', arg: ''},
    ],
    options: ['Kopieren', 'Addition', 'Subtraktion', 'Multiplikation'],
    correct_index: 0,
  },
  {
    id: 'T5_abs',
    variant: 1,
    question: 'Was macht dieses Programm?',
    program: [
      {addr: '0000', op: 'LDA', arg: '(13)'},
      {addr: '0001', op: 'BRN', arg: '0100'},
      {addr: '0010', op: 'STA', arg: '15'},
      {addr: '0011', op: 'END', arg: ''},
      {addr: '0100', op: 'LDA', arg: '#0'},
      {addr: '0101', op: 'SUB', arg: '(13)'},
      {addr: '0110', op: 'STA', arg: '15'},
      {addr: '0111', op: 'END', arg: ''},
    ],
    options: ['Maximum', 'Betrag', 'Minimum', 'Subtraktion'],
    correct_index: 1,
  },
  {
    id: 'T6_min',
    variant: 1,
    question: 'Was macht dieses Programm?',
    program: [
      {addr: '0000', op: 'LDA', arg: '(13)'},
      {addr: '0001', op: 'SUB', arg: '(14)'},
      {addr: '0010', op: 'BRN', arg: '0110'},
      {addr: '0011', op: 'LDA', arg: '(14)'},
      {addr: '0100', op: 'STA', arg: '15'},
      {addr: '0101', op: 'END', arg: ''},
      {addr: '0110', op: 'LDA', arg: '(13)'},
      {addr: '0111', op: 'STA', arg: '15'},
      {addr: '1000', op: 'END', arg: ''},
    ],
    options: ['Minimum', 'Addition', 'Maximum', 'Division'],
    correct_index: 0,
  },
  {
    id: 'T7_max',
    variant: 1,
    question: 'Was macht dieses Programm?',
    program: [
      {addr: '0000', op: 'LDA', arg: '(13)'},
      {addr: '0001', op: 'SUB', arg: '(14)'},
      {addr: '0010', op: 'BRN', arg: '0110'},
      {addr: '0011', op: 'LDA', arg: '(13)'},
      {addr: '0100', op: 'STA', arg: '15'},
      {addr: '0101', op: 'END', arg: ''},
      {addr: '0110', op: 'LDA', arg: '(14)'},
      {addr: '0111', op: 'STA', arg: '15'},
      {addr: '1000', op: 'END', arg: ''},
    ],
    options: ['Addition', 'Maximum', 'Minimum', 'Betrag'],
    correct_index: 1,
  },
  {
    id: 'T1_add_v2',
    variant: 2,
    question: 'Welcher Wert steht am Ende in (15)?',
    initial_values: {'13': 4, '14': 7},
    program: [
      {addr: '0000', op: 'LDA', arg: '(13)'},
      {addr: '0001', op: 'ADD', arg: '(14)'},
      {addr: '0010', op: 'STA', arg: '15'},
      {addr: '0011', op: 'END', arg: ''},
    ],
    options: ['11', '3', '28', '0'],
    correct_index: 0,
  },
  {
    id: 'T2_sub_v2',
    variant: 2,
    question: 'Welcher Wert steht am Ende in (15)?',
    initial_values: {'13': 9, '14': 5},
    program: [
      {addr: '0000', op: 'LDA', arg: '(13)'},
      {addr: '0001', op: 'SUB', arg: '(14)'},
      {addr: '0010', op: 'STA', arg: '15'},
      {addr: '0011', op: 'END', arg: ''},
    ],
    options: ['14', '4', '-4', '0'],
    correct_index: 1,
  },
  {
    id: 'T3_mul_v2',
    variant: 2,
    question: 'Welcher Wert steht am Ende in (15)?',
    initial_values: {'13': 6},
    program: [
      {addr: '0000', op: 'LDA', arg: '(13)'},
      {addr: '0001', op: 'ADD', arg: '(13)'},
      {addr: '0010', op: 'STA', arg: '15'},
      {addr: '0011', op: 'END', arg: ''},
    ],
    options: ['12', '3', '9', '1'],
    correct_index: 0,
  },
  {
    id: 'T4_copy_v2',
    variant: 2,
    question: 'Welcher Wert steht am Ende in (15)?',
    initial_values: {'13': 10},
    program: [
      {addr: '0000', op: 'LDA', arg: '(13)'},
      {addr: '0001', op: 'STA', arg: '15'},
      {addr: '0010', op: 'END', arg: ''},
    ],
    options: ['10', '0', '15', '5'],
    correct_index: 0,
  },
  {
    id: 'T5_abs_v2',
    variant: 2,
    question: 'Welcher Wert steht am Ende in (15)?',
    initial_values: {'13': -6},
    program: [
      {addr: '0000', op: 'LDA', arg: '(13)'},
      {addr: '0001', op: 'BRN', arg: '0100'},
      {addr: '0010', op: 'STA', arg: '15'},
      {addr: '0011', op: 'END', arg: ''},
      {addr: '0100', op: 'LDA', arg: '#0'},
      {addr: '0101', op: 'SUB', arg: '(13)'},
      {addr: '0110', op: 'STA', arg: '15'},
      {addr: '0111', op: 'END', arg: ''},
    ],
    options: ['-6', '0', '6', '1'],
    correct_index: 2,
  },
  {
    id: 'T6_min_v2',
    variant: 2,
    question: 'Welcher Wert steht am Ende in (15)?',
    initial_values: {'13': 8, '14': 5},
    program: [
      {addr: '0000', op: 'LDA', arg: '(13)'},
      {addr: '0001', op: 'SUB', arg: '(14)'},
      {addr: '0010', op: 'BRN', arg: '0110'},
      {addr: '0011', op: 'LDA', arg: '(14)'},
      {addr: '0100', op: 'STA', arg: '15'},
      {addr: '0101', op: 'END', arg: ''},
      {addr: '0110', op: 'LDA', arg: '(13)'},
      {addr: '0111', op: 'STA', arg: '15'},
      {addr: '1000', op: 'END', arg: ''},
    ],
    options: ['8', '5', '3', '13'],
    correct_index: 1,
  },
  {
    id: 'T7_max_v2',
    variant: 2,
    question: 'Welcher Wert steht am Ende in (15)?',
    initial_values: {'13': 2, '14': 9},
    program: [
      {addr: '0000', op: 'LDA', arg: '(13)'},
      {addr: '0001', op: 'SUB', arg: '(14)'},
      {addr: '0010', op: 'BRN', arg: '0110'},
      {addr: '0011', op: 'LDA', arg: '(13)'},
      {addr: '0100', op: 'STA', arg: '15'},
      {addr: '0101', op: 'END', arg: ''},
      {addr: '0110', op: 'LDA', arg: '(14)'},
      {addr: '0111', op: 'STA', arg: '15'},
      {addr: '1000', op: 'END', arg: ''},
    ],
    options: ['2', '9', '11', '7'],
    correct_index: 1,
  },
];

/**
 * Generates 4 random rounds with 2 from variant 1 and 2 from variant 2
 */
export const generateRounds = (): AssemblyTask[] => {
  const variant1Tasks = ASSEMBLY_TASKS.filter(t => t.variant === 1);
  const variant2Tasks = ASSEMBLY_TASKS.filter(t => t.variant === 2);

  // Shuffle helper
  const shuffle = <T>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Pick 2 random tasks from each variant
  const shuffled1 = shuffle(variant1Tasks);
  const shuffled2 = shuffle(variant2Tasks);

  const selected1 = shuffled1.slice(0, 2);
  const selected2 = shuffled2.slice(0, 2);

  // Combine and shuffle the final set
  const allSelected = [...selected1, ...selected2];
  return shuffle(allSelected);
};
