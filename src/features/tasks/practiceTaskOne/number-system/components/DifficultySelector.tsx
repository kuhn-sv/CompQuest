import React from 'react';
import { Difficulty, DIFFICULTIES } from '../../../../../shared/enums/difficulty.enum';

const difficultyLabels: Record<Difficulty, string> = {
	[Difficulty.Easy]: 'leicht',
	[Difficulty.Medium]: 'mittel',
	[Difficulty.Hard]: 'schwer',
	[Difficulty.Expert]: 'superschwer',
};

interface DifficultySelectorProps {
	difficulty: Difficulty;
	onDifficultyChange: (difficulty: Difficulty) => void;
	onStartSet: () => void;
	onResetSet: () => void;
	onEvaluate: () => void;
	hasActiveTasks: boolean;
	canEvaluate: boolean;
	evaluated: boolean;
	correctCount: number;
	totalTasks: number;
}

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({
	difficulty,
	onDifficultyChange,
	onStartSet,
	onResetSet,
	onEvaluate,
	hasActiveTasks,
	canEvaluate,
	evaluated,
	correctCount,
	totalTasks,
}) => {
	return (
		<div className="ns-controls">
			<div className="difficulty">
				<label>Schwierigkeitsgrad:</label>
				<select value={difficulty} onChange={e => onDifficultyChange(e.target.value as Difficulty)}>
					{DIFFICULTIES.map(d => (
						<option key={d} value={d}>{difficultyLabels[d]}</option>
					))}
				</select>
			</div>
			<div className="actions">
				<button onClick={onStartSet}>Starten</button>
				<button onClick={onResetSet} disabled={!hasActiveTasks}>Zurücksetzen</button>
				<button onClick={onEvaluate} disabled={!canEvaluate}>Auswerten</button>
			</div>
			{evaluated && (
				<div className="result">
					Ergebnis: {correctCount} / {totalTasks} richtig
				</div>
			)}
		</div>
	);
};