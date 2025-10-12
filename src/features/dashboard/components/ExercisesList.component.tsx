import React from 'react';
import './ExercisesList.component.scss';
import {Link} from 'react-router-dom';

export interface Exercise {
  id: string;
  title: string;
  description: string;
  path: string;
  progressPercent?: number;
  disabled?: boolean;
}

interface ExercisesListProps {
  exercises: Exercise[];
}

const ExercisesList: React.FC<ExercisesListProps> = ({exercises}) => (
  <div className="dashboard__exercises">
    {exercises.map(exercise =>
      // render disabled card when exercise.disabled === true
      exercise.disabled ? (
        <div
          key={exercise.id}
          style={{background: 'var(--text30)'}}
          className="dashboard__exercise-card dashboard__exercise-card--disabled"
          aria-disabled="true">
          {typeof exercise.progressPercent === 'number' && (
            <div
              className="dashboard__exercise-progress"
              aria-label="Fortschritt">
              {exercise.progressPercent}%
            </div>
          )}
          <h3 className="dashboard__exercise-title">{exercise.title}</h3>
          <p className="dashboard__exercise-description">
            {exercise.description}
          </p>
          <div className="dashboard__exercise-arrow">
            <span>→</span>
          </div>
        </div>
      ) : (
        <Link
          key={exercise.id}
          to={exercise.path}
          className="dashboard__exercise-card">
          {typeof exercise.progressPercent === 'number' && (
            <div
              className="dashboard__exercise-progress"
              aria-label="Fortschritt">
              {exercise.progressPercent}%
            </div>
          )}
          <h3 className="dashboard__exercise-title">{exercise.title}</h3>
          <p className="dashboard__exercise-description">
            {exercise.description}
          </p>
          <div className="dashboard__exercise-arrow">
            <span>→</span>
          </div>
        </Link>
      ),
    )}
  </div>
);

export default ExercisesList;
