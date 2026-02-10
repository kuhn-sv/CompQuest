import React, {useEffect, useState} from 'react';
import './ExercisesModal.component.scss';
import ExercisesList, {type Exercise} from './ExercisesList.component';
import {trainingService} from '../../../services/supabase/training.service';
import {helperModules} from '../../helpers/registry';
import {
  BADGE_CONFIG,
  BADGE_LEGEND_TIERS,
  isBadgeLevelSufficient,
} from '../../../shared/interfaces';
import {TASK_DISPLAY_NAMES} from '../../../shared/constants/taskDisplayNames';
import {useUserBadges} from '../../../shared/hooks/useUserBadges';

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
  const {badges} = useUserBadges();
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

  // Micro missions (local list) - include VonNeumannQuiz, ReadAssembly, WriteAssembly and JavaToAssembly
  const defaultMicroMissions: Exercise[] = [
    {
      id: 'von-neumann',
      title: TASK_DISPLAY_NAMES['von-neumann'],
      description: 'Quiz zur Von-Neumann-Architektur',
      path: '/task/von-neumann',
      progressPercent: undefined,
      disabled: false,
    },
    {
      id: 'read-assembly',
      title: TASK_DISPLAY_NAMES['read-assembly'],
      description: 'Lies den Assembler-Code und beantworte die Fragen',
      path: '/task/read-assembly',
      progressPercent: undefined,
      disabled: false,
    },
    {
      id: 'write-assembly',
      title: TASK_DISPLAY_NAMES['write-assembly'],
      description: 'Sortiere die Befehle in die richtige Reihenfolge',
      path: '/task/write-assembly',
      progressPercent: undefined,
      disabled: false,
    },
    {
      id: 'java-to-assembly',
      title: TASK_DISPLAY_NAMES['java-to-assembly'],
      description: 'Übersetze Java Code in Assembler',
      path: '/task/java-to-assembly',
      progressPercent: undefined,
      disabled: false,
    },
  ];
  const [microMissions] = useState<Exercise[]>(defaultMicroMissions);
  const [microMissionsWithProgress, setMicroMissionsWithProgress] =
    useState<Exercise[]>(defaultMicroMissions);

  // Determine whether Mikroprozessortechnik is locked
  const isMikroLocked = !isBadgeLevelSufficient(
    badges['zahlendarstellung']?.badgeLevel ?? 'none',
    'bronze',
  );

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
      const [m, , mm] = await Promise.all([
        loadProgress(missions, true),
        loadProgress(helpers, false),
        loadProgress(microMissions, true),
      ]);
      
      if (!cancelled) {
        setMissionsWithProgress(m);
        setMicroMissionsWithProgress(mm);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [show, missions, helpers, microMissions]);

  if (!show) return null;

  const togglePanel = (key: string) => {
    // Prevent opening the Mikroprozessortechnik panel when locked
    if (key === '2-mikroprozessortechnik' && isMikroLocked) return;
    setOpenPanels(prev => ({...prev, [key]: !prev[key]}));
  };

  const renderTopicBadges = (category: string) => {
    const badge = badges[category];
    if (!badge) return null;

    const isCompleted =
      badge.completedTasks >= badge.totalTasks &&
      badge.totalTasks > 0 &&
      badge.badgeLevel !== 'none';

    return (
      <span className="dashboard__topic-badges">
        {isCompleted && (
          <span className="dashboard__topic-badge dashboard__topic-badge--completed">
            <span className="dashboard__topic-badge-icon">✓</span>
            Abgeschlossen
          </span>
        )}
        {badge.badgeLevel !== 'none' && (
          <span
            className={`dashboard__topic-badge dashboard__topic-badge--${badge.badgeLevel}`}>
            <span className="dashboard__topic-badge-icon">
              {BADGE_CONFIG[badge.badgeLevel].icon}
            </span>
            {BADGE_CONFIG[badge.badgeLevel].label}
          </span>
        )}
      </span>
    );
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

        <div className="dashboard__badge-legend">
          <span className="dashboard__badge-legend-label">
            <span className="dashboard__badge-legend-info">ⓘ</span>
            Badge-System:
          </span>
          {BADGE_LEGEND_TIERS.map(tier => (
            <span
              key={tier.level}
              className={`dashboard__badge-legend-item dashboard__badge-legend-item--${tier.level}`}>
              {tier.icon} {tier.label} ({tier.description})
            </span>
          ))}
        </div>

        <div className="dashboard__accordion">
          {/* Accordion 1: Zahlendarstellung - contains missions + helpers (current behavior) */}
          <div className="dashboard__accordion-item">
            <button
              className="dashboard__accordion-header"
              onClick={() => togglePanel('1-zahlendarstellung')}
              aria-expanded={!!openPanels['1-zahlendarstellung']}>
              <span className="dashboard__accordion-title-row">
                <span>1. Zahlendarstellung</span>
                {renderTopicBadges('zahlendarstellung')}
              </span>
              <span className="dashboard__accordion-toggle">
                {openPanels['1-zahlendarstellung'] ? '▾' : '▸'}
              </span>
            </button>
            <div
              className={`dashboard__accordion-body ${openPanels['1-zahlendarstellung'] ? 'is-open' : ''}`}
              aria-hidden={!openPanels['1-zahlendarstellung']}>
              <div className="dashboard__section">
                <div className="dashboard__section-title-row">
                  <span className="dashboard__section-title">Missionen</span>
                  {badges['zahlendarstellung'] && (
                    <span className="dashboard__section-avg">
                      Ø Genauigkeit:{' '}
                      {Math.round(badges['zahlendarstellung'].avgAccuracy)}%
                    </span>
                  )}
                </div>
                <ExercisesList exercises={missionsWithProgress} />
              </div>

              <div className="dashboard__section-separator" />

              <div className="dashboard__section">
                <div className="dashboard__section-title">Hilfsmodule</div>
                <ExercisesList
                  exercises={Object.values(helperModules)
                    .filter(module => module.topic === 'zahlendarstellung')
                    .map(module => ({
                      id: module.slug,
                      title: `Hilfsmodul: ${module.title}`,
                      description: module.description || '',
                      path: `/hilfsmodul/${module.slug}`,
                      progressPercent: undefined,
                      disabled: false,
                    }))}
                />
              </div>
            </div>
          </div>

          {/* Accordion 2: Mikroprozessortechnik */}
          <div
            className={`dashboard__accordion-item${isMikroLocked ? ' dashboard__accordion-item--locked' : ''}`}>
            <button
              className={`dashboard__accordion-header${isMikroLocked ? ' dashboard__accordion-header--locked' : ''}`}
              onClick={() => togglePanel('2-mikroprozessortechnik')}
              aria-expanded={!!openPanels['2-mikroprozessortechnik']}
              aria-disabled={isMikroLocked}
              disabled={isMikroLocked}>
              <span className="dashboard__accordion-title-row">
                <span>
                  {isMikroLocked && (
                    <span className="dashboard__lock-icon">🔒</span>
                  )}
                  2. Mikroprozessortechnik
                </span>
                {isMikroLocked ? (
                  <span className="dashboard__locked-hint">
                    Erreiche mindestens Bronze in Zahlendarstellung
                  </span>
                ) : (
                  renderTopicBadges('mikroprozessortechnik')
                )}
              </span>
              <span className="dashboard__accordion-toggle">
                {openPanels['2-mikroprozessortechnik'] ? '▾' : '▸'}
              </span>
            </button>
            <div
              className={`dashboard__accordion-body ${openPanels['2-mikroprozessortechnik'] ? 'is-open' : ''}`}
              aria-hidden={!openPanels['2-mikroprozessortechnik']}>
              <div className="dashboard__section">
                <div className="dashboard__section-title-row">
                  <span className="dashboard__section-title">Missionen</span>
                  {badges['mikroprozessortechnik'] && (
                    <span className="dashboard__section-avg">
                      Ø Genauigkeit:{' '}
                      {Math.round(badges['mikroprozessortechnik'].avgAccuracy)}%
                    </span>
                  )}
                </div>
                <ExercisesList
                  exercises={
                    isMikroLocked
                      ? microMissionsWithProgress.map(ex => ({
                          ...ex,
                          disabled: true,
                        }))
                      : microMissionsWithProgress
                  }
                />
              </div>

              <div className="dashboard__section-separator" />

              <div className="dashboard__section">
                <div className="dashboard__section-title">Hilfsmodule</div>
                <ExercisesList
                  exercises={Object.values(helperModules)
                    .filter(module => module.topic === 'mikroprozessortechnik')
                    .map(module => ({
                      id: module.slug,
                      title: `Hilfsmodul: ${module.title}`,
                      description: module.description || '',
                      path: `/hilfsmodul/${module.slug}`,
                      progressPercent: undefined,
                      disabled: false,
                    }))}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExercisesModal;
