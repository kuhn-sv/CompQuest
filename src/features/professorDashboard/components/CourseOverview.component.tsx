import React from 'react';
import MissionTable from './MissionTable.component';
import type {CategoryMissionGroup} from '../interfaces/professorDashboard.interfaces';
import './CourseOverview.component.scss';

interface CourseOverviewProps {
  categoryGroups: CategoryMissionGroup[];
  totalStudents: number;
  loading: boolean;
  error: string | null;
}

const courseName = import.meta.env.VITE_COURSE_NAME as string | undefined;

const CourseOverview: React.FC<CourseOverviewProps> = ({
  categoryGroups,
  totalStudents,
  loading,
  error,
}) => {
  return (
    <section className="course-overview">
      <div className="course-overview__header">
        <h2 className="course-overview__title">
          {courseName || 'Kursübersicht'}
        </h2>
        <span className="course-overview__hint">
          ⓘ Mission wählen für Detail-Analytik
        </span>
      </div>

      {loading && (
        <div className="course-overview__loading">Daten werden geladen…</div>
      )}

      {error && <div className="course-overview__error">Fehler: {error}</div>}

      {!loading && !error && (
        <MissionTable
          categoryGroups={categoryGroups}
          totalStudents={totalStudents}
        />
      )}
    </section>
  );
};

export default CourseOverview;
