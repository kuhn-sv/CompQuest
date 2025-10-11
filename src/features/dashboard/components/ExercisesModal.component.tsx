import React, {useEffect, useState} from 'react';
import './ExercisesModal.component.scss';
import ExercisesList, {type Exercise} from './ExercisesList.component';
import {trainingService} from '../../../services/supabase/training.service';

interface ExercisesModalProps {
  show: boolean;
  onClose: () => void;
  missions: Exercise[];
  helpers: Exercise[];
  topicTitle?: string; // e.g., "1. Zahlendarstellung"
}

const ExercisesModal: React.FC<ExercisesModalProps> = ({
  show,
  onClose,
  missions,
  helpers,
  topicTitle = 'Übungsaufgaben',
}) => {
  const [missionsWithProgress, setMissionsWithProgress] =
    useState<Exercise[]>(missions);
  const [helpersWithProgress, setHelpersWithProgress] =
    useState<Exercise[]>(helpers);

  useEffect(() => {
    let cancelled = false;
    const loadProgress = async (items: Exercise[]): Promise<Exercise[]> => {
      const results = await Promise.all(
        items.map(async ex => {
          try {
            const row = await trainingService.getStatsForTask(ex.id);
            const accuracy =
              row && row.best_accuracy != null
                ? Math.round(Number(row.best_accuracy))
                : 0;
            return {...ex, progressPercent: accuracy} as Exercise;
          } catch {
            return {...ex, progressPercent: 0} as Exercise;
          }
        }),
      );
      return results;
    };

    if (!show) return; // avoid work when modal hidden
    (async () => {
      const [m, h] = await Promise.all([
        loadProgress(missions),
        loadProgress(helpers),
      ]);
      if (!cancelled) {
        setMissionsWithProgress(m);
        setHelpersWithProgress(h);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [show, missions, helpers]);

  if (!show) return null;
  return (
    <div className="dashboard__overlay">
      <div className="dashboard__overlay-content">
        <div className="dashboard__overlay-header">
          <h2>{topicTitle}</h2>
          <button
            className="dashboard__close-btn"
            onClick={onClose}
            aria-label="Schließen">
            ✕
          </button>
        </div>

        <div className="dashboard__section">
          <div className="dashboard__section-title">Missionen</div>
          <ExercisesList exercises={missionsWithProgress} />
        </div>

        <div className="dashboard__section-separator" />

        <div className="dashboard__section">
          <div className="dashboard__section-title">Hilfsmodule</div>
          <ExercisesList exercises={helpersWithProgress} />
        </div>
      </div>
    </div>
  );
};

export default ExercisesModal;
