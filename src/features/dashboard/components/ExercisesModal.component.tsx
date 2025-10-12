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
  const [helpersList, setHelpersList] = useState<Exercise[]>(helpers);

  useEffect(() => {
    let cancelled = false;
    const loadProgress = async (
      items: Exercise[],
      showProgress: boolean,
    ): Promise<Exercise[]> => {
      if (!showProgress) {
        // Helper-Module: progressPercent immer undefined
        return items.map(ex => ({...ex, progressPercent: undefined}));
      }
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
        loadProgress(missions, true),
        loadProgress(helpers, false),
      ]);
      // Inject two placeholder items (hard-coded) for upcoming content
      const placeholderMissions: Exercise[] = [
        {
          id: 'placeholder-fest-gleitkomma',
          title: 'Fest- Gleitkomma',
          description: 'coming soon',
          path: '#',
          progressPercent: undefined,
          disabled: true,
        },
      ];
      const placeholderHelpers: Exercise[] = [
        {
          id: 'placeholder-uebertragshelfer',
          title: 'Hilfsmodul: Übertragshelfer',
          description: 'coming soon',
          path: '#',
          progressPercent: undefined,
          disabled: true,
        },
      ];

      const missionsWithPlaceholders = [...m, ...placeholderMissions];
      const helpersWithPlaceholders = [...h, ...placeholderHelpers];
      if (!cancelled) {
        setMissionsWithProgress(missionsWithPlaceholders);
        setHelpersList(helpersWithPlaceholders);
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
          <ExercisesList exercises={helpersList} />
        </div>
      </div>
    </div>
  );
};

export default ExercisesModal;
