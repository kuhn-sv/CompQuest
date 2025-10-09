import React, { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './number-system.page.scss';
import { generateSet } from './numberSystem.helper';
import { Difficulty } from '../../../../shared/enums/difficulty.enum';
import type { NumberTask, AnswerOption } from './interfaces/numberSystem.interface';
import type { StageScore, EvaluationConfig, EvaluationResult } from './interfaces/evaluation.interface';
import type { AssignmentMap } from './numberSystem.types';
import { ResultsSection } from './components';
import { EquationRow as SharedEquationRow } from '../../../../shared/components/equationrow/EquationRow';
import NumberWithBase from '../../../../shared/components/number/NumberWithBase.component';
import { ConnectionOverlay } from '../../../../shared/components';
import type { SubTaskComponentProps } from '../interfaces';
import { useDragAndDrop, useConnectionLines, useTimer, CONNECTION_LINE_PRESETS, DRAG_DROP_PRESETS } from '../../../../shared/hooks';

const NumberSystemComponent: React.FC<SubTaskComponentProps> = ({ onControlsChange, onHudChange }) => {
	// Staged progression: Easy → Medium → Hard
	const stages: Difficulty[] = useMemo(() => [Difficulty.Easy, Difficulty.Medium, Difficulty.Hard], []);
	const [stageIndex, setStageIndex] = useState<number>(0);
	const [tasks, setTasks] = useState<NumberTask[]>([]);
	const [answerPool, setAnswerPool] = useState<AnswerOption[]>([]);
	const [assignments, setAssignments] = useState<AssignmentMap>({});
	const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
	const containerRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
	const [evaluated, setEvaluated] = useState<boolean>(false);
	const [hasStarted, setHasStarted] = useState<boolean>(false);
	const [stageScores, setStageScores] = useState<StageScore[]>([]);
	const [finalResult, setFinalResult] = useState<EvaluationResult | null>(null);

	// Config: 3 minutes threshold = 180000 ms, 1 point bonus
	const evalConfig: EvaluationConfig = useMemo(() => ({ timeBonusThresholdMs: 3 * 60 * 1000, timeBonusPoints: 1 }), []);

	// Timer functionality
	const { isRunning, start, stop, reset, formatTime, getElapsed } = useTimer();

	// Drag and Drop logic
	const {
		draggedItem: draggedAnswer,
		dragOverTargetId: dragOverTaskId,
		handleDragStart,
		handleDragOver,
		handleDragEnter,
		handleDragLeave,
		handleDrop,
		handleDragEnd,
		resetDragState
	} = useDragAndDrop<AnswerOption>(DRAG_DROP_PRESETS.NUMBER_SYSTEM);

	// Connection lines calculation
	const getTaskIdCb = useCallback((task: NumberTask) => task.id, []);
	const compareAnswersCb = useCallback((assignment: AnswerOption, poolAnswer: AnswerOption) => (
		assignment.value === poolAnswer.value && assignment.base === poolAnswer.base
	), []);

		const rawConnectionLines = useConnectionLines({
			tasks,
			assignments,
			answerPool,
			containerRef,
			getTaskId: getTaskIdCb,
			compareAnswers: compareAnswersCb,
			...CONNECTION_LINE_PRESETS.NUMBER_SYSTEM,
			debug: false
		});

		// Nach Auswertung: Status für jede Linie setzen
		const connectionLines = useMemo(() => {
				if (!evaluated) return rawConnectionLines;
				return rawConnectionLines.map(line => {
					const task = tasks.find(t => t.id === line.taskId);
					const assigned = assignments[line.taskId];
					let status: 'correct' | 'wrong' = 'wrong';
					if (assigned && task && assigned.value === task.expectedValue && assigned.base === task.toBase) {
						status = 'correct';
					}
					return {
						...line,
						status
					};
				});
		}, [rawConnectionLines, evaluated, tasks, assignments]);

	const startSetForStage = useCallback((idx: number, options?: { resetTimer?: boolean }) => {
		const { resetTimer: shouldResetTimer = true } = options ?? {};
		const difficulty = stages[idx];
		const { tasks, answerPool } = generateSet(difficulty);
		setTasks(tasks);
		setAnswerPool(answerPool);
		setAssignments(Object.fromEntries(tasks.map(t => [t.id, null])));
		setEvaluated(false);
		setActiveTaskId(null);
		// Start the timer when a new set begins
		if (shouldResetTimer) {
			reset();
		}
		start();
	}, [reset, start, stages]);

	// Initial start handler: reveal tasks and kick off stage 1
	const handleInitialStart = useCallback(() => {
		setHasStarted(true);
		setStageIndex(0);
		startSetForStage(0, { resetTimer: true });
	}, [startSetForStage]);

	const resetSet = useCallback(() => {
		setAssignments(Object.fromEntries(tasks.map(t => [t.id, null])));
		setEvaluated(false);
		setActiveTaskId(null);
		resetDragState();
		// Reset and restart timer
		reset();
		if (tasks.length > 0) {
			start();
		}
	}, [reset, resetDragState, start, tasks]);

	// Wrapper function for assignment logic
		const assignAnswer = useCallback((taskId: string, answer: AnswerOption) => {
		// If answer is already used, swap: remove from previous task
		setAssignments(prev => {
			const next: AssignmentMap = { ...prev };
			// Remove any previous usage of this answer
			for (const k of Object.keys(next)) {
				if (next[k] && next[k]!.value === answer.value && next[k]!.base === answer.base) next[k] = null;
			}
			next[taskId] = answer;
			return next;
		});
		setActiveTaskId(null);
		}, []);

	// Drop handler for the hook
	const onDropAnswer = (taskId: string, answer: AnswerOption) => {
		assignAnswer(taskId, answer);
	};

		// Adapters to use shared ResultsSection (accepts broader AnswerOptionBase)
		const handleDragStartAdapter = useCallback((e: React.DragEvent, answer: { value: string; base?: number | string }) => {
			if (typeof answer.base === 'number') {
				handleDragStart(e, { value: answer.value, base: answer.base as AnswerOption['base'] });
			}
		}, [handleDragStart]);

		const assignAnswerAdapter = useCallback((taskId: string, answer: { value: string; base?: number | string }) => {
			if (typeof answer.base === 'number') {
				assignAnswer(taskId, { value: answer.value, base: answer.base as AnswerOption['base'] });
			}
		}, [assignAnswer]);

	const usedAnswerKeys = useMemo(() => {
		return new Set(
			Object.values(assignments)
				.filter((a): a is AnswerOption => !!a)
				.map(a => `${a.value}|${a.base}`)
		);
	}, [assignments]);

	const allAssigned = useMemo(() => tasks.length > 0 && tasks.every(t => assignments[t.id]), [tasks, assignments]);
	const correctCount = useMemo(() => tasks.filter(t => {
		const a = assignments[t.id];
		return a && a.value === t.expectedValue && a.base === t.toBase;
	}).length, [tasks, assignments]);

	const evaluate = useCallback(() => {
		setEvaluated(true);
		// Stop timer upon evaluation to freeze time display
		stop();

		// Compute stage score
		const difficulty = stages[stageIndex];
		const total = tasks.length;
		const correct = tasks.filter(t => {
			const a = assignments[t.id];
			return a && a.value === t.expectedValue && a.base === t.toBase;
		}).length;
		const points = correct; // 1 point per correct pair
		setStageScores(prev => {
			const next = [...prev];
			// Overwrite or append current stage score
			next[stageIndex] = { difficulty, correct, total, points };
			return next;
		});

		// If this was the last stage, compute final result
		if (stageIndex === stages.length - 1) {
			const elapsedMs = getElapsed();
			const withinThreshold = elapsedMs <= evalConfig.timeBonusThresholdMs;
			const timeBonus = withinThreshold ? evalConfig.timeBonusPoints : 0;
			const totalCorrect = stageScores.reduce((sum, s) => sum + (s?.correct ?? 0), 0) + correct;
			const totalPossible = stageScores.reduce((sum, s) => sum + (s?.total ?? 0), 0) + total;
			const totalPoints = totalCorrect + timeBonus;
			const perStage: StageScore[] = (() => {
				const base = [...stageScores];
				base[stageIndex] = { difficulty, correct, total, points };
				return base;
			})();
			setFinalResult({ elapsedMs, withinThreshold, timeBonus, perStage, totalCorrect, totalPossible, totalPoints });
		}
	}, [assignments, evalConfig.timeBonusPoints, evalConfig.timeBonusThresholdMs, getElapsed, stageIndex, stageScores, stages, stop, tasks]);

	const goToNextStage = useCallback(() => {
		if (stageIndex < stages.length - 1) {
			const nextIndex = stageIndex + 1;
			setStageIndex(nextIndex);
			// Resume timer: do not reset
			startSetForStage(nextIndex, { resetTimer: false });
		}
	}, [stageIndex, stages, startSetForStage]);

	// Provide footer controls to parent
	useEffect(() => {
		if (!hasStarted || tasks.length === 0) {
			onControlsChange?.(null);
			onHudChange?.(null);
			return;
		}
		onControlsChange?.({
			onReset: resetSet,
			onEvaluate: evaluate,
			onNext: goToNextStage,
			showReset: !evaluated,
			showEvaluate: true,
			showNext: evaluated && stageIndex < stages.length - 1,
			disableReset: !tasks.length,
			disableEvaluate: !allAssigned,
			disableNext: false,
		});
		// Cleanup when unmounting
		return () => {
			onControlsChange?.(null);
			onHudChange?.(null);
		};
	}, [hasStarted, tasks.length, evaluated, stageIndex, stages, allAssigned, correctCount, onControlsChange, onHudChange, resetSet, evaluate, goToNextStage]);

	// Update HUD in parent header
	useEffect(() => {
		if (!hasStarted || tasks.length === 0) return;
		onHudChange?.({
			subtitle: 'Datenfluss wiederherstellen',
			progress: { current: stageIndex + 1, total: stages.length },
			requestTimer: isRunning ? 'start' : undefined,
		});
	}, [hasStarted, tasks.length, stageIndex, stages.length, isRunning, onHudChange]);

	return (
		<div className="number-system-container">
			<div className="ns-header">
				<h1>Zahlensysteme – Übung 1.1</h1>
			</div>

			{/* Header timer/progress moved to container */}


			{hasStarted && tasks.length > 0 && (
				<div className={`ns-content ${activeTaskId ? 'has-active' : ''}`} ref={containerRef}>
					<div className="equations-and-results">
						{/* Left side: Equation rows */}
						<div className="equations-section">
							{tasks.map((t) => {
								const assigned = assignments[t.id];
								const isCorrect = evaluated && !!assigned && assigned.value === t.expectedValue && assigned.base === t.toBase;
								const isWrong = evaluated && !!assigned && !(assigned.value === t.expectedValue && assigned.base === t.toBase);
								const isActive = activeTaskId === t.id;
								return (
									<SharedEquationRow
										key={t.id}
										hasAssignment={!!assigned}
										sourceContent={<NumberWithBase value={t.sourceValue} base={t.fromBase} />}
										assignedContent={assigned ? <NumberWithBase value={assigned.value} base={assigned.base} /> : null}
										isCorrect={isCorrect}
										isWrong={isWrong}
										isActive={isActive}
										isDragOver={dragOverTaskId === t.id}
										onClick={() => setActiveTaskId(t.id)}
										onDragOver={(e) => handleDragOver(e, t.id)}
										onDragEnter={(e) => handleDragEnter(e, t.id)}
										onDragLeave={handleDragLeave}
										onDrop={(e) => handleDrop(e, t.id, onDropAnswer)}
									/>
								);
							})}
						</div>

						{/* Right side: Available results */}
									<ResultsSection 
										answerPool={answerPool}
										usedAnswerKeys={usedAnswerKeys}
										assignments={assignments}
										draggedAnswer={draggedAnswer}
										activeTaskId={activeTaskId}
										tasks={tasks}
										handleDragStart={handleDragStartAdapter}
										handleDragEnd={handleDragEnd}
										assignAnswer={assignAnswerAdapter}
										evaluated={evaluated}
										renderAnswer={(a) => (
										  typeof a.base === 'number'
											? <NumberWithBase value={a.value} base={a.base as 2|8|10|16} />
											: a.value
										)}
									/>
					</div>

					{/* SVG overlay for connection lines */}
					<ConnectionOverlay connectionLines={connectionLines} />

					{/* Controls moved to parent footer */}
				</div>
			)}

			{/* Initial start overlay with a large round button */}
			{!hasStarted && (
				<div className="ns-start-overlay">
					<button className="ns-start-button" onClick={handleInitialStart} aria-label="Aufgabe starten">
						Start
					</button>
				</div>
			)}

			{/* Final evaluation summary overlay */}
			{finalResult && (
				<div className="ns-summary-overlay" role="dialog" aria-modal="true">
					<div className="ns-summary-card">
						<h2>Auswertung</h2>
						<div className="ns-summary-row">
							<span>Zeit:</span>
							<strong>{formatTime(finalResult.elapsedMs)}</strong>
						</div>
						<div className="ns-summary-row">
							<span>Grenze für Bonus:</span>
							<strong>{formatTime(evalConfig.timeBonusThresholdMs)} ({finalResult.withinThreshold ? 'unter' : 'über'})</strong>
						</div>
						<hr />
						<div className="ns-summary-stages">
							{finalResult.perStage.map((s, idx) => (
								<div key={idx} className="ns-summary-row">
									<span>Stufe {idx + 1} ({s.difficulty.charAt(0).toUpperCase() + s.difficulty.slice(1)}):</span>
									<strong>{s.correct} / {s.total} Punkte</strong>
								</div>
							))}
						</div>
						<hr />
						<div className="ns-summary-row">
							<span>Gesamt (Antworten):</span>
							<strong>{finalResult.totalCorrect} / {finalResult.totalPossible}</strong>
						</div>
						<div className="ns-summary-row">
							<span>Zeitbonus:</span>
							<strong>{finalResult.timeBonus}</strong>
						</div>
						<div className="ns-summary-total">
							<span>Gesamtpunkte:</span>
							<strong>{finalResult.totalPoints}</strong>
						</div>
						<div className="ns-summary-actions">
							<Link to="/dashboard" className="button">Beenden</Link>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default NumberSystemComponent;