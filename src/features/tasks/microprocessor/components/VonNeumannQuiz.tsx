import React, {useEffect, useState} from 'react';
import './VonNeumannQuiz.component.scss';
import type {TaskStageScore} from '../../../../shared/interfaces/tasking.interfaces';

interface QuizItem {
  id: string;
  label: string;
  isCore: boolean;
}

interface Props {
  items: QuizItem[];
  onChange?: (score: TaskStageScore | null) => void;
  evaluated?: boolean;
}

const VonNeumannQuiz: React.FC<Props> = ({items, onChange, evaluated}) => {
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => {
    setSelected(prev => ({...prev, [id]: !prev[id]}));
  };

  // Calculate and report score whenever selection changes
  useEffect(() => {
    const totalPossible = items.filter(i => i.isCore).length;
    const correctCount = items.filter(i => selected[i.id] && i.isCore).length;
    const incorrectCount = items.filter(i => selected[i.id] && !i.isCore).length;

    const score: TaskStageScore = {
      difficulty: 'Quiz',
      correct: correctCount,
      total: totalPossible,
      points: correctCount - incorrectCount,
    };

    onChange?.(score);
  }, [selected, items, onChange]);

  return (
    <ul className="von-quizz__list">
      {items.map(item => (
        <li
          key={item.id}
          className={`von-quizz__item ${
            evaluated && selected[item.id]
              ? item.isCore
                ? 'is-correct'
                : 'is-wrong'
              : ''
          }`}>
          <button
            type="button"
            className={`von-quizz__btn ${selected[item.id] ? 'is-selected' : ''}`}
            onClick={() => toggle(item.id)}
            aria-pressed={!!selected[item.id]}
            aria-label={item.label}
            disabled={evaluated}>
            <span
              className={`von-quizz__radio ${selected[item.id] ? 'is-selected' : ''}`}
              aria-hidden="true"
            />
            <span className="von-quizz__label">{item.label}</span>
          </button>
        </li>
      ))}
    </ul>
  );
};

export default VonNeumannQuiz;

