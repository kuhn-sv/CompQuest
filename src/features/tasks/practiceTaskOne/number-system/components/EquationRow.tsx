import React from 'react';
import NumberWithBase from '../../../../../shared/components/number/NumberWithBase.component';
import type { NumberTask, AnswerOption } from '../interfaces/numberSystem.interface';

interface EquationRowProps {
	task: NumberTask;
	assignment: AnswerOption | null;
	isCorrect: boolean;
	isWrong: boolean;
	isActive: boolean;
	isDragOver: boolean;
	onClick: () => void;
	onDragOver: (e: React.DragEvent) => void;
	onDragEnter: (e: React.DragEvent) => void;
	onDragLeave: (e: React.DragEvent) => void;
	onDrop: (e: React.DragEvent) => void;
}

export const EquationRow: React.FC<EquationRowProps> = ({
	task,
	assignment,
	isCorrect,
	isWrong,
	isActive,
	isDragOver,
	onClick,
	onDragOver,
	onDragEnter,
	onDragLeave,
	onDrop,
}) => {
	return (
		<div 
			className={`equation-row ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''} ${isActive ? 'active' : ''} ${assignment ? 'has-result' : ''} ${isDragOver ? 'drag-over' : ''}`} 
			onClick={onClick}
			onDragOver={onDragOver}
			onDragEnter={onDragEnter}
			onDragLeave={onDragLeave}
			onDrop={onDrop}
		>
			{/* Leading line before source input */}
			<span className="lead-line lead-line--leading" />
			
			{/* Source input field */}
			<div className="input-field source-field">
				<NumberWithBase value={task.sourceValue} base={task.fromBase} />
			</div>
			
			{/* Line to equals sign - always visible */}
			<span className="connector-line" />
			
			{/* Equals sign */}
			<div className="equals-sign">＝</div>
			
			{/* Result placeholder (where assigned result will move to) */}
			<div className="result-placeholder">
				{assignment && (
					<>
						{/* Connector line from equals to result */}
						<span className="connector-line" />
						<div className="input-field result-field assigned">
							<NumberWithBase value={assignment.value} base={assignment.base} />
						</div>
					</>
				)}
			</div>
		</div>
	);
};