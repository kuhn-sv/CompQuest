import readAssemblyTasksData from '../../../../data/tasks/read-assembly.json';
import { shuffle } from '../shared';
import type { AssemblyTask } from './readAssembly.interfaces';

export const generateRounds = (): AssemblyTask[] => {
  const tasks = readAssemblyTasksData as AssemblyTask[];
  const variant1Tasks = tasks.filter(t => t.variant === 1);
  const variant2Tasks = tasks.filter(t => t.variant === 2);

  const selected1 = shuffle(variant1Tasks).slice(0, 2);
  const selected2 = shuffle(variant2Tasks).slice(0, 2);

  return shuffle([...selected1, ...selected2]);
};
