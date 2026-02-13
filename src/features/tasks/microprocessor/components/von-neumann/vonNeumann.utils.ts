import type { VonNeumannRound } from './vonneumann.helper';
import vonNeumannData from '../../../../../data/tasks/von-neumann.json';
import { shuffle } from '../shared';

type RoundType = 'quiz' | 'functions' | 'reconstruct' | 'busAssignment';

export const DEFAULT_ROUNDS = 4;

/** Generate Von-Neumann rounds from JSON data */
export const generateRounds = (count: number): VonNeumannRound[] => {
  const rounds: VonNeumannRound[] = [];
  const data = vonNeumannData as {
    quizItems: { id: string; label: string; isCore: boolean }[];
    reconstructComponents: string[];
    busComponents: string[];
    idToLabel: Record<string, string>;
    idToDesc: Record<string, string>;
  };

  const generateFunctionPairs = () => {
    const poolIds = [
      'cpu',
      'ram',
      'peripherie',
      'bus',
      'alu',
      'control',
      'rom',
    ];
    const shuffledIds = shuffle(poolIds);
    const chosenIds = shuffledIds.slice(0, 4);
    const leftItems = chosenIds.map(id => ({ id, label: data.idToLabel[id] }));
    const rightItems = shuffle(
      chosenIds.map(id => ({ id, label: data.idToDesc[id] })),
    );

    return { left: leftItems, right: rightItems };
  };

  for (let i = 0; i < count; i++) {
    if (i === 2) {
      rounds.push({
        id: 'vonneumann-reconstruct-3',
        type: 'reconstruct',
        components: data.reconstructComponents,
      });
    } else if (i === 3) {
      rounds.push({
        id: 'vonneumann-bus-4',
        type: 'busAssignment',
        buses: data.busComponents,
      });
    } else {
      const type: RoundType = i % 2 === 0 ? 'quiz' : 'functions';

      if (type === 'quiz') {
        rounds.push({
          id: `vonneumann-quiz-${i + 1}`,
          type: 'quiz',
          items: data.quizItems,
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
