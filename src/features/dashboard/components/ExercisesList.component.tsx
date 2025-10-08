import React from 'react';
import './ExercisesList.component.scss';
import { Link } from 'react-router-dom';

export interface Exercise {
  id: string;
  title: string;
  description: string;
  path: string;
}

interface ExercisesListProps {
  exercises: Exercise[];
}

const ExercisesList: React.FC<ExercisesListProps> = ({ exercises }) => (
  <div className="dashboard__exercises">
    {exercises.map((exercise) => (
      <Link
        key={exercise.id}
        to={exercise.path}
        className="dashboard__exercise-card"
      >
        <h3 className="dashboard__exercise-title">{exercise.title}</h3>
        <p className="dashboard__exercise-description">
          {exercise.description}
        </p>
        <div className="dashboard__exercise-arrow">
          <span>→</span>
        </div>
      </Link>
    ))}
  </div>
);

export default ExercisesList;
