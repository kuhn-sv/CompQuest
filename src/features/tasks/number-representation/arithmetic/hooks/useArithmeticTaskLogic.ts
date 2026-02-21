import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Difficulty } from '@shared/enums/difficulty.enum';
import { useFeedbackSound } from '@shared/hooks';
import { AdditionTask, AdditionSet } from '../addition.helper';
import { PAStageScore } from '../arithmetic.interfaces';
import { AnswerOptionBase } from '../../shared/number-task/NumberTask.types';

export interface UseArithmeticTaskLogicProps {
    generateTasks: (difficulty: Difficulty) => AdditionSet;
    getElapsed?: () => number;
    onSummaryChange?: (summary: {
        elapsedMs: number;
        perStage: PAStageScore[];
    }) => void;
    onHudChange?: (state: {
        progress: { current: number; total: number } | null;
    }) => void;
    stages?: Difficulty[];
}

export const useArithmeticTaskLogic = ({
    generateTasks,
    getElapsed,
    onSummaryChange,
    onHudChange,
    stages = [Difficulty.Easy, Difficulty.Medium, Difficulty.Hard],
}: UseArithmeticTaskLogicProps) => {
    const [stageIndex, setStageIndex] = useState<number>(0);
    const [tasks, setTasks] = useState<AdditionTask[]>([]);
    const [answerPool, setAnswerPool] = useState<AnswerOptionBase[]>([]);
    const [assignments, setAssignments] = useState<
        Record<string, AnswerOptionBase | null>
    >({});
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
    const [evaluated, setEvaluated] = useState<boolean>(false);
    const [stageScores, setStageScores] = useState<PAStageScore[]>([]);

    // Stable ref for onHudChange to avoid dependency cycles if used in effects
    const onHudChangeRef = useRef(onHudChange);
    useEffect(() => {
        onHudChangeRef.current = onHudChange;
    }, [onHudChange]);

    const { playFeedback } = useFeedbackSound();

    const startSetForStage = useCallback(
        (idx: number) => {
            const difficulty = stages[idx];
            const { tasks, answerPool } = generateTasks(difficulty);
            setTasks(tasks);
            setAnswerPool(answerPool);
            setAssignments(Object.fromEntries(tasks.map(t => [t.id, null])));
            setEvaluated(false);
            setActiveTaskId(null);
        },
        [stages, generateTasks],
    );

    const handleInitialStart = useCallback(() => {
        setStageIndex(0);
        startSetForStage(0);
    }, [startSetForStage]);

    const resetSet = useCallback(() => {
        setAssignments(Object.fromEntries(tasks.map(t => [t.id, null])));
        setEvaluated(false);
        setActiveTaskId(null);
        // Update HUD progress (timer continues)
        onHudChangeRef.current?.({
            progress: { current: stageIndex + 1, total: stages.length },
        });
    }, [tasks, stageIndex, stages.length]);

    const assignAnswer = useCallback(
        (taskId: string, answer: AnswerOptionBase) => {
            setAssignments(prev => {
                const toKey = (
                    a: { value: string; base?: number | string } | null | undefined,
                ) => (a ? `${a.value}|${a.base}` : '');
                const targetKey = toKey(answer);
                const prevAssignedKey = toKey(prev[taskId]);

                // No-op if the same answer is already assigned to this task
                if (prevAssignedKey === targetKey) return prev;

                // How many identical answers exist in the pool?
                const available = answerPool.filter(
                    a => `${a.value}|${a.base}` === targetKey,
                ).length;
                // How many are currently assigned (excluding current task)?
                const currentlyAssigned = Object.entries(prev).filter(
                    ([tid, a]) => tid !== taskId && a && toKey(a) === targetKey,
                ).length;

                // If capacity available, assign without removing previous uses
                if (currentlyAssigned < available) {
                    return { ...prev, [taskId]: answer };
                }
                return prev;
            });
            setActiveTaskId(null);
        },
        [answerPool],
    );

    const evaluate = useCallback(() => {
        setEvaluated(true);
        const difficulty = stages[stageIndex];
        const total = tasks.length;
        const correct = tasks.filter(t => {
            const a = assignments[t.id];
            const aBase =
                typeof a?.base === 'string' ? parseInt(a.base, 10) : a?.base;
            return !!a && a.value === t.expected && aBase === t.base;
        }).length;
        const points = correct;
        playFeedback(correct === total);
        setStageScores(prev => {
            const next = [...prev];
            next[stageIndex] = { difficulty, correct, total, points };
            return next;
        });

        if (stageIndex === stages.length - 1) {
            const elapsedMs = getElapsed?.() ?? 0;
            const perStage = (() => {
                const base = [...stageScores];
                base[stageIndex] = { difficulty, correct, total, points };
                return base;
            })();

            onSummaryChange?.({
                elapsedMs,
                perStage: perStage.map(s => ({ ...s, difficulty: s.difficulty })),
            });
        }
    }, [
        assignments,
        getElapsed,
        onSummaryChange,
        stageIndex,
        tasks,
        stages,
        stageScores,
    ]);

    const goToNextStage = useCallback(() => {
        if (stageIndex < stages.length - 1) {
            const nextIndex = stageIndex + 1;
            setStageIndex(nextIndex);
            startSetForStage(nextIndex);
            onHudChangeRef.current?.({
                progress: { current: nextIndex + 1, total: stages.length },
            });
        }
    }, [stageIndex, stages.length, startSetForStage]);

    const usedAnswerKeys = useMemo(() => {
        return new Set(
            Object.values(assignments)
                .filter((a): a is { value: string; base: number } => !!a)
                .map(a => `${a.value}|${a.base}`),
        );
    }, [assignments]);

    return {
        stageIndex,
        stages,
        tasks,
        answerPool,
        assignments,
        activeTaskId,
        evaluated,
        setActiveTaskId,
        handleInitialStart,
        resetSet,
        assignAnswer,
        evaluate,
        goToNextStage,
        usedAnswerKeys,
    };
};
