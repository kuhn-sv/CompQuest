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
  // accordion state: which panels are open
  const [openPanels, setOpenPanels] = useState<Record<string, boolean>>({
    '1-zahlendarstellung': false,
    '2-mikroprozessortechnik': false,
  });

  // When the modal opens, ensure all accordion panels are closed by default
  useEffect(() => {
    if (show) {
      setOpenPanels({
        '1-zahlendarstellung': false,
        '2-mikroprozessortechnik': false,
      });
    }
  }, [show]);

  // Micro missions (local list) - include VonNeumannQuiz, ReadAssembly and WriteAssembly
  const defaultMicroMissions: Exercise[] = [
    {
      id: 'von-neumann',
      title: 'Von-Neumann-Architektur',
      description: 'Quiz zur Von-Neumann-Architektur',
      path: '/task/von-neumann',
      progressPercent: undefined,
      disabled: false,
    },
    {
      id: 'read-assembly',
      title: 'Assembler-Programm lesen',
      description: 'Lies den Assembler-Code und beantworte die Fragen',
      path: '/task/read-assembly',
      progressPercent: undefined,
      disabled: false,
    },
    {
      id: 'write-assembly',
      title: 'Assembler-Programm schreiben',
      description: 'Sortiere die Befehle in die richtige Reihenfolge',
      path: '/task/write-assembly',
      progressPercent: undefined,
      disabled: false,
    },
  ];
  const [microMissions] = useState<Exercise[]>(defaultMicroMissions);
  const [microMissionsWithProgress, setMicroMissionsWithProgress] =
    useState<Exercise[]>(defaultMicroMissions);

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
      const [m, h, mm] = await Promise.all([
        loadProgress(missions, true),
        loadProgress(helpers, false),
        loadProgress(microMissions, true),
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
      const microWithPlaceholders = [...mm];
      if (!cancelled) {
        setMissionsWithProgress(missionsWithPlaceholders);
        setHelpersList(helpersWithPlaceholders);
        setMicroMissionsWithProgress(microWithPlaceholders);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [show, missions, helpers, microMissions]);

  if (!show) return null;

  const togglePanel = (key: string) => {
    setOpenPanels(prev => ({...prev, [key]: !prev[key]}));
  };

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

        <div className="dashboard__accordion">
          {/* Accordion 1: Zahlendarstellung - contains missions + helpers (current behavior) */}
          <div className="dashboard__accordion-item">
            <button
              className="dashboard__accordion-header"
              onClick={() => togglePanel('1-zahlendarstellung')}
              aria-expanded={!!openPanels['1-zahlendarstellung']}>
              <span>1. Zahlendarstellung</span>
              <span className="dashboard__accordion-toggle">
                {openPanels['1-zahlendarstellung'] ? '▾' : '▸'}
              </span>
            </button>
            <div
              className={`dashboard__accordion-body ${openPanels['1-zahlendarstellung'] ? 'is-open' : ''}`}
              aria-hidden={!openPanels['1-zahlendarstellung']}>
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

          {/* Accordion 2: Mikroprozessortechnik - placeholder content for now */}
          <div className="dashboard__accordion-item">
            <button
              className="dashboard__accordion-header"
              onClick={() => togglePanel('2-mikroprozessortechnik')}
              aria-expanded={!!openPanels['2-mikroprozessortechnik']}>
              <span>2. Mikroprozessortechnik</span>
              <span className="dashboard__accordion-toggle">
                {openPanels['2-mikroprozessortechnik'] ? '▾' : '▸'}
              </span>
            </button>
            <div
              className={`dashboard__accordion-body ${openPanels['2-mikroprozessortechnik'] ? 'is-open' : ''}`}
              aria-hidden={!openPanels['2-mikroprozessortechnik']}>
              <div className="dashboard__section">
                <div className="dashboard__section-title">Missionen</div>
                <ExercisesList exercises={microMissionsWithProgress} />
              </div>

              <div className="dashboard__section-separator" />

              <div className="dashboard__section">
                <div className="dashboard__section-title">Hilfsmodule</div>
                <ExercisesList exercises={[] /* no helpers yet */} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExercisesModal;
