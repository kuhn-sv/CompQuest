import React from 'react';
import { AccuracyRing } from '../../tasks/shared/components';
import {formatTimeFromMs} from '../utils/professorDashboard.utils';
import type {PlayerMissionStats} from '../interfaces/professorDashboard.interfaces';
import './PlayerMissionRow.component.scss';

interface PlayerMissionRowProps {
  mission: PlayerMissionStats;
}

const PlayerMissionRow: React.FC<PlayerMissionRowProps> = ({mission}) => {
  return (
    <tr className="player-mission-row">
      <td className="player-mission-row__name">{mission.displayName}</td>
      <td className="player-mission-row__result">
        {mission.completed ? (
          <span className="player-mission-row__badge player-mission-row__badge--completed">
            Abgeschlossen
          </span>
        ) : (
          <span className="player-mission-row__badge player-mission-row__badge--open">
            Offen
          </span>
        )}
      </td>
      <td className="player-mission-row__accuracy">
        {mission.completed ? (
          <AccuracyRing accuracy={mission.bestAccuracy} size={44} />
        ) : (
          <span className="player-mission-row__no-data">–</span>
        )}
      </td>
      <td className="player-mission-row__time">
        {mission.completed ? formatTimeFromMs(mission.bestTimeMs) : '–:–– Min.'}
      </td>
    </tr>
  );
};

export default PlayerMissionRow;
