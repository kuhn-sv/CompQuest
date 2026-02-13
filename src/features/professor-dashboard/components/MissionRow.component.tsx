import React from 'react';
import AccuracyRing from '../../../shared/components/task/accuracy-ring/AccuracyRing.component';
import {formatTimeFromMs} from '../utils/professorDashboard.utils';
import type {MissionStats} from '../interfaces/professorDashboard.interfaces';
import './MissionRow.component.scss';

interface MissionRowProps {
  mission: MissionStats;
  totalStudents: number;
  onClick?: (taskId: string) => void;
}

const MissionRow: React.FC<MissionRowProps> = ({
  mission,
  totalStudents,
  onClick,
}) => {
  const handleClick = () => onClick?.(mission.taskId);

  return (
    <tr
      className={`mission-row ${onClick ? 'mission-row--clickable' : ''}`}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={e => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}>
      <td className="mission-row__name">{mission.displayName}</td>
      <td className="mission-row__participants">
        {mission.participantCount} / {totalStudents}
      </td>
      <td className="mission-row__accuracy">
        {mission.participantCount > 0 ? (
          <AccuracyRing accuracy={mission.avgAccuracy} size={44} />
        ) : (
          <span className="mission-row__no-data">–</span>
        )}
      </td>
      <td className="mission-row__time">
        {mission.participantCount > 0
          ? formatTimeFromMs(mission.avgTimeMs)
          : '–:–– Min.'}
      </td>
    </tr>
  );
};

export default MissionRow;
