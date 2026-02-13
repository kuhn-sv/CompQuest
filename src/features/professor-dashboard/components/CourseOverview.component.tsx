import React from 'react';
import MissionTable from './MissionTable.component';
import MissionRow from './MissionRow.component';
import type {
  CategoryMissionGroup,
  MissionStats,
  TableColumnDef,
} from '../interfaces/professorDashboard.interfaces';
import './CourseOverview.component.scss';

const COURSE_COLUMNS: TableColumnDef[] = [
  {key: 'name', label: 'Mission', className: 'mission-table__col-name'},
  {
    key: 'participants',
    label: 'Teilnehmer',
    className: 'mission-table__col-participants',
  },
  {
    key: 'accuracy',
    label: 'Präzision',
    className: 'mission-table__col-accuracy',
  },
  {key: 'time', label: 'Zeit', className: 'mission-table__col-time'},
];

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
  const renderCourseRow = (mission: MissionStats) => (
    <MissionRow
      key={mission.taskId}
      mission={mission}
      totalStudents={totalStudents}
    />
  );

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
          columns={COURSE_COLUMNS}
          categoryGroups={categoryGroups}
          renderRow={renderCourseRow}
        />
      )}
    </section>
  );
};

export default CourseOverview;
