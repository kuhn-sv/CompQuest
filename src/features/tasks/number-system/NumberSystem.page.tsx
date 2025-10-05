import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './number-system.page.scss';
import { generateSet } from './numberSystem.helper';
import { Difficulty } from '../../../shared/enums/difficulty.enum';
import type { NumberTask, AnswerOption } from './interfaces/numberSystem.interface';
import type { AssignmentMap } from './numberSystem.types';
import { DifficultySelector, EquationRow, ResultsSection } from './components';
import { ConnectionOverlay } from '../../../shared/components/ConnectionOverlay';
import { useDragAndDrop, useConnectionLines } from '../../../shared/hooks';

const NumberSystemPage: React.FC = () => {
	const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Easy);
	const [tasks, setTasks] = useState<NumberTask[]>([]);
	const [answerPool, setAnswerPool] = useState<AnswerOption[]>([]);
	const [assignments, setAssignments] = useState<AssignmentMap>({});
	const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
	const containerRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
	const [evaluated, setEvaluated] = useState<boolean>(false);

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
	} = useDragAndDrop<AnswerOption>();

	// Connection lines calculation
	const connectionLines = useConnectionLines({
		tasks,
		assignments,
		answerPool,
		containerRef,
		getTaskId: (task) => task.id,
		compareAnswers: (assignment, poolAnswer) => 
			assignment.value === poolAnswer.value && assignment.base === poolAnswer.base,
		debug: false
	});

	const startSet = () => {
		const { tasks, answerPool } = generateSet(difficulty);
		setTasks(tasks);
		setAnswerPool(answerPool);
		setAssignments(Object.fromEntries(tasks.map(t => [t.id, null])));
		setEvaluated(false);
		setActiveTaskId(null);
	};

	const resetSet = () => {
		setAssignments(Object.fromEntries(tasks.map(t => [t.id, null])));
		setEvaluated(false);
		setActiveTaskId(null);
		resetDragState();
	};

	// Wrapper function for assignment logic
	const assignAnswer = (taskId: string, answer: AnswerOption) => {
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
	};

	// Drop handler for the hook
	const onDropAnswer = (taskId: string, answer: AnswerOption) => {
		assignAnswer(taskId, answer);
	};

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

	const evaluate = () => {
		setEvaluated(true);
	};

	return (
		<div className="number-system-container">
			<div className="ns-header">
				<Link to="/dashboard" className="back-to-dashboard">← Zurück zum Dashboard</Link>
				<h1>Zahlensysteme – Übung 1.1</h1>
			</div>

			<DifficultySelector
				difficulty={difficulty}
				onDifficultyChange={setDifficulty}
				onStartSet={startSet}
				onResetSet={resetSet}
				onEvaluate={evaluate}
				hasActiveTasks={tasks.length > 0}
				canEvaluate={allAssigned}
				evaluated={evaluated}
				correctCount={correctCount}
				totalTasks={tasks.length}
			/>

			{tasks.length > 0 && (
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
									<EquationRow
										key={t.id}
										task={t}
										assignment={assigned}
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
							handleDragStart={handleDragStart}
							handleDragEnd={handleDragEnd}
							assignAnswer={assignAnswer}
						/>
					</div>

					{/* Debug info (can be removed later) */}
					{draggedAnswer && (
						<div style={{ position: 'fixed', top: '10px', right: '10px', background: 'rgba(0,0,0,0.8)', color: 'white', padding: '10px', borderRadius: '5px', zIndex: 1000 }}>
							Dragging: {draggedAnswer.value}<sub>{draggedAnswer.base}</sub>
						</div>
					)}

					{/* SVG overlay for connection lines */}
					<ConnectionOverlay connectionLines={connectionLines} />
				</div>
			)}
		</div>
	);
};

export default NumberSystemPage;