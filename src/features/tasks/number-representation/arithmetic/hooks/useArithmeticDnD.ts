import { useState, useCallback } from 'react';
import { DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core';
import { AnswerOptionBase } from '../../shared/number-task/NumberTask.types';

interface UseArithmeticDnDProps {
    assignAnswer: (taskId: string, answer: AnswerOptionBase) => void;
}

export const useArithmeticDnD = ({ assignAnswer }: UseArithmeticDnDProps) => {
    const [dndDraggedAnswer, setDndDraggedAnswer] =
        useState<AnswerOptionBase | null>(null);
    const [dndDragOverTaskId, setDndDragOverTaskId] = useState<string | null>(
        null,
    );

    const handleDragStart = useCallback(
        (event: DragStartEvent) => {
            const { active } = event;
            if (!active || typeof active.id !== 'string') return;
            const parts = active.id.split(':');
            const last = parts[parts.length - 1]; // VALUE|BASE
            const [value, baseStr] = last.split('|');
            const base = parseInt(baseStr, 10);
            if (value && !Number.isNaN(base)) {
                setDndDraggedAnswer({ value, base });
            }
        },
        [],
    );

    const handleDragOver = useCallback(
        (event: DragOverEvent) => {
            const { over } = event;
            if (!over || typeof over.id !== 'string') {
                setDndDragOverTaskId(null);
                return;
            }
            if (over.id.startsWith('task:')) {
                setDndDragOverTaskId(over.id.replace(/^task:/, ''));
            } else {
                setDndDragOverTaskId(null);
            }
        },
        [],
    );

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;
            if (
                !over ||
                typeof active.id !== 'string' ||
                typeof over.id !== 'string'
            ) {
                setDndDraggedAnswer(null);
                setDndDragOverTaskId(null);
                return;
            }
            if (active.id.includes('answer') && over.id.startsWith('task:')) {
                const parts = (active.id as string).split(':');
                const last = parts[parts.length - 1]; // VALUE|BASE
                const [value, baseStr] = last.split('|');
                const base = parseInt(baseStr, 10);
                const taskId = over.id.replace(/^task:/, '');
                if (taskId && value && !Number.isNaN(base)) {
                    assignAnswer(taskId, { value, base });
                }
            }
            setDndDraggedAnswer(null);
            setDndDragOverTaskId(null);
        },
        [assignAnswer],
    );

    const resetDnDState = useCallback(() => {
        setDndDraggedAnswer(null);
        setDndDragOverTaskId(null);
    }, []);

    return {
        dndDraggedAnswer,
        dndDragOverTaskId,
        handleDragStart,
        handleDragOver,
        handleDragEnd,
        resetDnDState,
    };
};
