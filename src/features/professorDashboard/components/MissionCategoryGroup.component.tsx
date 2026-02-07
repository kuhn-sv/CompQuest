import React from 'react';
import MissionRow from './MissionRow.component';
import type {CategoryMissionGroup} from '../interfaces/professorDashboard.interfaces';
import './MissionCategoryGroup.component.scss';

interface MissionCategoryGroupProps {
  group: CategoryMissionGroup;
  totalStudents: number;
  onMissionClick?: (taskId: string) => void;
}

const MissionCategoryGroup: React.FC<MissionCategoryGroupProps> = ({
  group,
  totalStudents,
  onMissionClick,
}) => {
  return (
    <tbody className="mission-category-group">
      <tr className="mission-category-group__header">
        <td colSpan={4}>
          <span className="mission-category-group__dot" />
          <span className="mission-category-group__name">
            {group.displayName}
          </span>
        </td>
      </tr>
      {group.missions.map(mission => (
        <MissionRow
          key={mission.taskId}
          mission={mission}
          totalStudents={totalStudents}
          onClick={onMissionClick}
        />
      ))}
    </tbody>
  );
};

export default MissionCategoryGroup;
