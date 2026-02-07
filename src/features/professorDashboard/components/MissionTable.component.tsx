import React from 'react';
import MissionCategoryGroup from './MissionCategoryGroup.component';
import type {CategoryMissionGroup} from '../interfaces/professorDashboard.interfaces';
import './MissionTable.component.scss';

interface MissionTableProps {
  categoryGroups: CategoryMissionGroup[];
  totalStudents: number;
  onMissionClick?: (taskId: string) => void;
}

const MissionTable: React.FC<MissionTableProps> = ({
  categoryGroups,
  totalStudents,
  onMissionClick,
}) => {
  return (
    <div className="mission-table-wrapper">
      <table className="mission-table">
        <thead>
          <tr>
            <th className="mission-table__col-name">Mission</th>
            <th className="mission-table__col-participants">Teilnehmer</th>
            <th className="mission-table__col-accuracy">Präzision</th>
            <th className="mission-table__col-time">Zeit</th>
          </tr>
        </thead>
        {categoryGroups.map(group => (
          <MissionCategoryGroup
            key={group.category}
            group={group}
            totalStudents={totalStudents}
            onMissionClick={onMissionClick}
          />
        ))}
      </table>
    </div>
  );
};

export default MissionTable;
