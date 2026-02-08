import React from 'react';
import ProfileSelector from './ProfileSelector.component';
import CategorySummaryCards from './CategorySummaryCards.component';
import MissionTable from './MissionTable.component';
import PlayerMissionRow from './PlayerMissionRow.component';
import {usePlayerProfile} from '../hooks/usePlayerProfile';
import type {
  PlayerMissionStats,
  TableColumnDef,
} from '../interfaces/professorDashboard.interfaces';
import './PlayerProfiles.component.scss';

const PLAYER_COLUMNS: TableColumnDef[] = [
  {key: 'name', label: 'Mission', className: 'mission-table__col-name'},
  {key: 'result', label: 'Ergebnis', className: 'mission-table__col-result'},
  {
    key: 'accuracy',
    label: 'Präzision',
    className: 'mission-table__col-accuracy',
  },
  {key: 'time', label: 'Bestzeit', className: 'mission-table__col-best-time'},
];

const PlayerProfiles: React.FC = () => {
  const {
    students,
    selectedId,
    setSelectedId,
    categoryGroups,
    badges,
    loading,
    error,
  } = usePlayerProfile();

  const selectedStudent = students.find(s => s.id === selectedId);

  const renderPlayerRow = (mission: PlayerMissionStats) => (
    <PlayerMissionRow key={mission.taskId} mission={mission} />
  );

  return (
    <section className="player-profiles">
      <div className="player-profiles__header">
        <ProfileSelector
          students={students}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        {selectedStudent?.matrikelnummer && (
          <span className="player-profiles__matrikel">
            Matrikelnr. {selectedStudent.matrikelnummer}
          </span>
        )}
      </div>

      {error && <div className="player-profiles__error">Fehler: {error}</div>}

      {!selectedId && !loading && (
        <div className="player-profiles__empty">
          <span className="player-profiles__empty-icon">👤</span>
          <p className="player-profiles__empty-text">Kein Profil ausgewählt</p>
          <p className="player-profiles__empty-hint">
            Wähle einen Spieler aus dem Dropdown, um dessen Profil zu sehen.
          </p>
        </div>
      )}

      {selectedId && loading && (
        <div className="player-profiles__loading">
          Profildaten werden geladen…
        </div>
      )}

      {selectedId && !loading && !error && (
        <>
          <CategorySummaryCards badges={badges} />

          <MissionTable
            columns={PLAYER_COLUMNS}
            categoryGroups={categoryGroups}
            renderRow={renderPlayerRow}
            title="Kampagnen-Log"
            titleIcon="📋"
          />
        </>
      )}
    </section>
  );
};

export default PlayerProfiles;
