import type {AssemblyCommand} from './assembly.types';

/**
 * Calculates the score based on correct and wrong answers
 * Score = max(0, correct - wrong)
 *
 * @param correct - Number of correct answers
 * @param wrong - Number of wrong answers
 * @returns The calculated score (minimum 0)
 */
export const calculateScore = (correct: number, wrong: number): number => {
  return Math.max(0, correct - wrong);
};

/**
 * Parses an assembler command string into an AssemblyCommand object
 *
 * @param cmd - The command string to parse (e.g., 'LDA (13)', 'END')
 * @returns The parsed AssemblyCommand object
 */
export const parseAssemblerCommand = (cmd: string): AssemblyCommand => {
  const parts = cmd.trim().split(' ');
  if (parts.length === 1) {
    return {op: parts[0], arg: null};
  }
  return {op: parts[0], arg: parts.slice(1).join(' ')};
};

/**
 * Generates available commands for a task by combining correct commands with distractors
 *
 * @param correctCommands - Array of correct commands
 * @param distractors - Array of distractor commands to choose from
 * @param numDistractors - Number range for distractors [min, max]
 * @returns Shuffled array of available commands
 */
export const generateAvailableCommands = (
  correctCommands: AssemblyCommand[],
  distractors: AssemblyCommand[],
  numDistractors: [number, number] = [3, 5],
): AssemblyCommand[] => {
  const commands = [...correctCommands];

  // Calculate random number of distractors within range
  const [min, max] = numDistractors;
  const count = Math.floor(Math.random() * (max - min + 1)) + min;

  // Shuffle distractors and select up to count
  const shuffledDistractors = [...distractors].sort(() => Math.random() - 0.5);

  // Add distractors that aren't already in correct commands
  let added = 0;
  for (const distractor of shuffledDistractors) {
    if (added >= count) break;

    const alreadyExists = commands.some(
      cmd => cmd.op === distractor.op && cmd.arg === distractor.arg,
    );

    if (!alreadyExists) {
      commands.push(distractor);
      added++;
    }
  }

  // Shuffle all commands
  return commands.sort(() => Math.random() - 0.5);
};

/**
 * Generates rounds with specific difficulty progression
 *
 * @param tasks - Array of all available tasks
 * @param progression - Array defining the difficulty progression (e.g., ['leicht', 'leicht', 'mittel', 'schwer'])
 * @returns Array of selected tasks following the progression
 */
export const generateRounds = <T extends {difficulty: string}>(
  tasks: T[],
  progression: string[],
): T[] => {
  const result: T[] = [];

  // Group tasks by difficulty
  const tasksByDifficulty = tasks.reduce(
    (acc, task) => {
      if (!acc[task.difficulty]) {
        acc[task.difficulty] = [];
      }
      acc[task.difficulty].push(task);
      return acc;
    },
    {} as Record<string, T[]>,
  );

  // For each difficulty in progression, select a random task
  for (const difficulty of progression) {
    const availableTasks = tasksByDifficulty[difficulty] || [];

    // Filter out already selected tasks
    const remainingTasks = availableTasks.filter(task => !result.includes(task));

    // If no remaining tasks, shuffle and pick from all tasks of this difficulty
    const tasksToChooseFrom =
      remainingTasks.length > 0 ? remainingTasks : availableTasks;

    if (tasksToChooseFrom.length > 0) {
      const shuffled = [...tasksToChooseFrom].sort(() => Math.random() - 0.5);
      result.push(shuffled[0]);
    }
  }

  return result;
};

