export interface AssemblyCommand {
  op: string;
  arg: string | null;
}

export interface WriteAssemblyTask {
  id: string;
  prosa_text: string;
  difficulty: string;
  commands: AssemblyCommand[];
}

// Complete task data
export const WRITE_ASSEMBLY_TASKS: WriteAssemblyTask[] = [
  {
    id: 'T1_subtract',
    prosa_text: 'Berechne x − y aus (13) und (14) und schreibe das Ergebnis nach (15).',
    difficulty: 'leicht',
    commands: [
      { op: 'LDA', arg: '(13)' },
      { op: 'SUB', arg: '(14)' },
      { op: 'STA', arg: '15' },
      { op: 'END', arg: null },
    ],
  },
  {
    id: 'T2_absolute',
    prosa_text: 'Lies a aus (13). Wenn a < 0, speichere -a, sonst a, in (15).',
    difficulty: 'leicht',
    commands: [
      { op: 'LDA', arg: '(13)' },
      { op: 'BRN', arg: '0100' },
      { op: 'STA', arg: '15' },
      { op: 'JMP', arg: '0111' },
      { op: 'LDA', arg: '#0' },
      { op: 'SUB', arg: '(13)' },
      { op: 'STA', arg: '15' },
      { op: 'END', arg: null },
    ],
  },
  {
    id: 'T3_multiply_by_3',
    prosa_text: 'Multipliziere x in (13) mit 3 und speichere das Ergebnis in (15).',
    difficulty: 'leicht',
    commands: [
      { op: 'LDA', arg: '(13)' },
      { op: 'ADD', arg: '(13)' },
      { op: 'ADD', arg: '(13)' },
      { op: 'STA', arg: '15' },
      { op: 'END', arg: null },
    ],
  },
  {
    id: 'T4_maximum',
    prosa_text: 'Vergleiche x (13) und y (14). Schreibe die größere Zahl nach (15).',
    difficulty: 'mittel',
    commands: [
      { op: 'LDA', arg: '(13)' },
      { op: 'SUB', arg: '(14)' },
      { op: 'BRN', arg: '0101' },
      { op: 'LDA', arg: '(13)' },
      { op: 'JMP', arg: '0110' },
      { op: 'LDA', arg: '(14)' },
      { op: 'STA', arg: '15' },
      { op: 'END', arg: null },
    ],
  },
  {
    id: 'T5_divide_by_2',
    prosa_text: 'Teile x aus (13) ganzzahlig durch 2. Ergebnis in (15).',
    difficulty: 'mittel',
    commands: [
      { op: 'LDA', arg: '#0' },
      { op: 'STA', arg: '15' },
      { op: 'LDA', arg: '(13)' },
      { op: 'SUB', arg: '#2' },
      { op: 'BRN', arg: '1010' },
      { op: 'STA', arg: '13' },
      { op: 'LDA', arg: '(15)' },
      { op: 'ADD', arg: '#1' },
      { op: 'STA', arg: '15' },
      { op: 'JMP', arg: '0010' },
      { op: 'END', arg: null },
    ],
  },
  {
    id: 'T6_multiply',
    prosa_text: 'Multipliziere a in (13) mit b in (14) per wiederholter Addition; Ergebnis in (15).',
    difficulty: 'schwer',
    commands: [
      { op: 'LDA', arg: '#0' },
      { op: 'STA', arg: '15' },
      { op: 'LDA', arg: '(14)' },
      { op: 'BRZ', arg: '1010' },
      { op: 'SUB', arg: '#1' },
      { op: 'STA', arg: '14' },
      { op: 'LDA', arg: '(15)' },
      { op: 'ADD', arg: '(13)' },
      { op: 'STA', arg: '15' },
      { op: 'JMP', arg: '0010' },
      { op: 'END', arg: null },
    ],
  },
];

// Distractor commands that could be used to add difficulty
const DISTRACTOR_COMMANDS: AssemblyCommand[] = [
  { op: 'LDA', arg: '(14)' },
  { op: 'LDA', arg: '#1' },
  { op: 'ADD', arg: '(14)' },
  { op: 'ADD', arg: '#1' },
  { op: 'SUB', arg: '(13)' },
  { op: 'SUB', arg: '#1' },
  { op: 'STA', arg: '14' },
  { op: 'STA', arg: '13' },
  { op: 'BRZ', arg: '0100' },
  { op: 'BRP', arg: '0100' },
  { op: 'JMP', arg: '0000' },
];

/**
 * Generates available commands for a task
 * Includes all correct commands plus some distractors
 */
export const generateAvailableCommands = (
  task: WriteAssemblyTask,
): AssemblyCommand[] => {
  const commands = [...task.commands];
  
  // Add 3-5 distractor commands
  const numDistractors = Math.floor(Math.random() * 3) + 3;
  const shuffledDistractors = [...DISTRACTOR_COMMANDS].sort(
    () => Math.random() - 0.5,
  );
  
  for (let i = 0; i < numDistractors && i < shuffledDistractors.length; i++) {
    const distractor = shuffledDistractors[i];
    // Don't add if already in correct commands
    if (
      !commands.some(cmd => cmd.op === distractor.op && cmd.arg === distractor.arg)
    ) {
      commands.push(distractor);
    }
  }
  
  // Shuffle all commands
  return commands.sort(() => Math.random() - 0.5);
};

/**
 * Generates 4 rounds with specific difficulty progression:
 * - Round 1-2: leicht
 * - Round 3: mittel
 * - Round 4: schwer
 */
export const generateRounds = (): WriteAssemblyTask[] => {
  // Group tasks by difficulty
  const easyTasks = WRITE_ASSEMBLY_TASKS.filter(t => t.difficulty === 'leicht');
  const mediumTasks = WRITE_ASSEMBLY_TASKS.filter(t => t.difficulty === 'mittel');
  const hardTasks = WRITE_ASSEMBLY_TASKS.filter(t => t.difficulty === 'schwer');
  
  // Select 2 random easy tasks
  const shuffledEasy = [...easyTasks].sort(() => Math.random() - 0.5);
  const selectedEasy = shuffledEasy.slice(0, 2);
  
  // Select 1 random medium task
  const shuffledMedium = [...mediumTasks].sort(() => Math.random() - 0.5);
  const selectedMedium = shuffledMedium.slice(0, 1);
  
  // Select 1 random hard task
  const shuffledHard = [...hardTasks].sort(() => Math.random() - 0.5);
  const selectedHard = shuffledHard.slice(0, 1);
  
  // Return in order: 2 easy, 1 medium, 1 hard
  return [...selectedEasy, ...selectedMedium, ...selectedHard];
};
