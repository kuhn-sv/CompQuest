
import React from 'react';
import { ResultsSectionShared } from '../../../../shared/numberTask/ResultsSection.shared';
import type { AdditionTask } from './addition.helper';
import type { AnswerOptionBase } from '../../../../shared/numberTask/NumberTask.types';

interface ResultsSectionProps {
  answerPool: AnswerOptionBase[];
  usedAnswerKeys: Set<string>;
  assignments: Record<string, AnswerOptionBase | null>;
  draggedAnswer: AnswerOptionBase | null;
  activeTaskId: string | null;
  tasks: AdditionTask[];
  handleDragStart: (e: React.DragEvent, answer: AnswerOptionBase) => void;
  handleDragEnd: () => void;
  assignAnswer: (taskId: string, answer: AnswerOptionBase) => void;
  evaluated: boolean;
}

export const ResultsSection: React.FC<ResultsSectionProps> = (props) => {
  return <ResultsSectionShared {...props} />;
};
