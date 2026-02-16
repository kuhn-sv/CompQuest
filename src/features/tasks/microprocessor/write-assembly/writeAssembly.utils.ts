import writeAssemblyTasksData from '../../data/tasks/write-assembly.json';
import { shuffle } from '../shared/assembly.utils';
import type { WriteAssemblyTask } from './writeAssembly.helper';

/** Generate rounds from JSON data: 2x leicht, 1x mittel, 1x schwer */
export const generateRounds = (): WriteAssemblyTask[] => {
  const tasks = writeAssemblyTasksData as WriteAssemblyTask[];

  const leichtTasks = tasks.filter(t => t.difficulty === 'leicht');
  const mittelTasks = tasks.filter(t => t.difficulty === 'mittel');
  const schwerTasks = tasks.filter(t => t.difficulty === 'schwer');

  const selected = [
    ...shuffle(leichtTasks).slice(0, 2),
    ...shuffle(mittelTasks).slice(0, 1),
    ...shuffle(schwerTasks).slice(0, 1),
  ];

  return selected;
};
