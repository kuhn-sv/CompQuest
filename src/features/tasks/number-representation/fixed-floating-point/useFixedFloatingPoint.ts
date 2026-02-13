import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { generateRounds, FixedFloatingRound, bitsToString } from './fixedFloatingPoint.helper';
import { useGameStartScreen, useHudState } from '@shared/hooks';
import type { SubTaskComponentProps } from '../interfaces';
import { Difficulty } from '@shared/enums/difficulty.enum';

export const useFixedFloatingPoint = ({
    onControlsChange,
    onHudChange,
    onSummaryChange,
    taskMeta,
    getElapsed,
    onTaskContextChange,
}: SubTaskComponentProps) => {
    const [rounds] = useState<FixedFloatingRound[]>(() => generateRounds());
    const [roundIndex, setRoundIndex] = useState(0);
    const [bits, setBits] = useState<number[]>(Array(8).fill(0));
    const [evaluated, setEvaluated] = useState(false);
    const [stageScores, setStageScores] = useState<
        Array<{
            difficulty: Difficulty;
            correct: number;
            total: number;
            points: number;
        }>
    >([]);

    const currentRound = rounds[roundIndex];

    // Start Screen Logic
    const { hasStarted, startTask } = useGameStartScreen({
        onHudChange,
        totalTasks: rounds.length,
        subtitle: 'Kalibrierungsprotokolle',
    });

    const isCorrect = useMemo(() => {
        return (
            evaluated && bitsToString(bits) === bitsToString(currentRound.expectedBits)
        );
    }, [evaluated, bits, currentRound]);

    // Reset bits when round changes or task starts
    const resetBits = useCallback(() => {
        setBits(Array(currentRound.bitCount).fill(0));
        setEvaluated(false);
    }, [currentRound]);

    const handleStart = useCallback(() => {
        startTask();
        resetBits();
    }, [startTask, resetBits]);

    const handleToggle = useCallback((newBits: number[]) => {
        if (!evaluated) {
            setBits(newBits);
        }
    }, [evaluated]);

    const handleReset = useCallback(() => {
        resetBits();
    }, [resetBits]);

    const handleEvaluate = useCallback(() => {
        setEvaluated(true);
        const correct = bitsToString(bits) === bitsToString(currentRound.expectedBits) ? 1 : 0;

        // Score update
        setStageScores(prev => {
            const next = [...prev];
            next[roundIndex] = {
                difficulty: Difficulty.Medium,
                correct,
                total: 1,
                points: correct
            };
            return next;
        });

        // Check for end of game
        if (roundIndex === rounds.length - 1) {
            const elapsedMs = getElapsed?.() ?? 0;
            // Optimistically update score for the summary
            const finalScores = [...stageScores];
            finalScores[roundIndex] = { difficulty: Difficulty.Medium, correct, total: 1, points: correct };

            onSummaryChange?.({
                elapsedMs,
                perStage: finalScores,
            });
        }
    }, [bits, currentRound, roundIndex, rounds.length, stageScores, getElapsed, onSummaryChange]);

    const handleNext = useCallback(() => {
        if (roundIndex < rounds.length - 1) {
            setRoundIndex(prev => prev + 1);
            // resetBits will be triggered by effect or we do it here?
            // Better do it here to avoid flicker or stale state 
            // but currentRound dependency in resetBits might be tricky.
            // We'll manually reset state for next round here.
            setBits(Array(8).fill(0));
            setEvaluated(false);
        }
    }, [roundIndex, rounds.length]);

    // Sync Controls
    // We need stable refs for controls to avoid loop (standard pattern in this repo)
    const resetRef = useRef(handleReset);
    const evaluateRef = useRef(handleEvaluate);
    const nextRef = useRef(handleNext);

    useEffect(() => { resetRef.current = handleReset; }, [handleReset]);
    useEffect(() => { evaluateRef.current = handleEvaluate; }, [handleEvaluate]);
    useEffect(() => { nextRef.current = handleNext; }, [handleNext]);

    useEffect(() => {
        if (!hasStarted) {
            onControlsChange?.(null);
            return;
        }

        onControlsChange?.({
            onReset: () => resetRef.current(),
            onEvaluate: () => evaluateRef.current(),
            onNext: () => nextRef.current(),
            showReset: true,
            showEvaluate: !evaluated,
            showNext: evaluated && roundIndex < rounds.length - 1,
            disableReset: evaluated,
            disableNext: !evaluated,
        });
    }, [hasStarted, evaluated, roundIndex, rounds.length, onControlsChange]);

    // Sync HUD
    const hudState = useMemo(() => {
        if (!hasStarted) return { progress: null, isStartScreen: true } as const;
        return {
            subtitle: 'Kalibrierungsprotokolle',
            progress: { current: roundIndex + 1, total: rounds.length },
        };
    }, [hasStarted, roundIndex, rounds.length]);
    useHudState(onHudChange, hudState);

    // Sync Context (for AskTim etc)
    useEffect(() => {
        if (!onTaskContextChange) return;
        if (!hasStarted) {
            onTaskContextChange(null);
            return;
        }
        onTaskContextChange({
            title: taskMeta?.title,
            round: roundIndex + 1,
            mode: currentRound.mode,
            targetValue: currentRound.targetValue,
        });
    }, [onTaskContextChange, hasStarted, roundIndex, currentRound, taskMeta]);

    return {
        hasStarted,
        currentRound,
        bits,
        evaluated,
        isCorrect,
        handleStart,
        handleToggle,
        roundsCount: rounds.length,
        taskMeta
    };
};
