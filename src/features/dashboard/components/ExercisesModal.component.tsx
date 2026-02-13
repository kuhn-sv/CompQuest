import React, {useEffect, useState} from 'react';
import './ExercisesModal.component.scss';
import ExercisesList, {type Exercise} from './ExercisesList.component';
import {trainingService} from '../../../services/supabase/training.service';
import {
  BADGE_CONFIG,
  BADGE_LEGEND_TIERS,
  isBadgeLevelSufficient,
} from '@shared/interfaces';
import {useUserBadges} from '@shared/hooks/useUserBadges';
import {EXERCISE_CATEGORIES} from './constants/categories';
import type {ExerciseCategory} from '../interfaces/exercise.interface'; // Correct import path

interface ExercisesModalProps {
  show: boolean;
  onClose: () => void;
  topicTitle?: string;
}

const ExercisesModal: React.FC<ExercisesModalProps> = ({
  show,
  onClose,
  topicTitle = 'Übungsaufgaben',
}) => {

  const [categoriesWithProgress, setCategoriesWithProgress] =
    useState<ExerciseCategory[]>(EXERCISE_CATEGORIES);

  const {badges} = useUserBadges();

  const [openPanels, setOpenPanels] = useState<Record<string, boolean>>(
    Object.fromEntries(EXERCISE_CATEGORIES.map(cat => [cat.id, false])),
  );

  // When the modal opens, ensure all accordion panels are closed by default
  useEffect(() => {
    if (show) {
      setOpenPanels(
        Object.fromEntries(EXERCISE_CATEGORIES.map(cat => [cat.id, false])),
      );
    }
  }, [show]);

  useEffect(() => {
    let cancelled = false;

    // Helper to load progress for a list of exercises
    const loadProgressForList = async (
      items: Exercise[],
    ): Promise<Exercise[]> => {
      const results = await Promise.all(
        items.map(async ex => {
          // If progressPercent is already set/hardcoded, keep it? 
          // Current logic: if it's undefined, try to fetch it.
          // Original logic: for helper modules, progress is undefined. For missions, fetch.
          // We can determine if it's a mission or helper by some flag or just try to fetch for all that don't have it?
          // The current helper implementation returns undefined.
          // BUT: helpers in EXERCISE_CATEGORIES don't have progressPercent set.
          // Let's assume ONLY missions need progress.
          // How to distinguish? helperModules vs missions field in category.
          // We'll process each category's lists separately.
          try {
             // Only fetch if it looks like a mission (e.g. typically helper modules don't have progress tracking in DB yet?)
             // Or just try for everything. Existing code: "Helper-Module: progressPercent immer undefined".
             // We will handle this when processing the category below.
            const row = await trainingService.getStatsForTask(ex.id);
            const accuracy =
              row && row.best_accuracy != null
                ? Math.round(Number(row.best_accuracy))
                : 0;
            return {...ex, progressPercent: accuracy} as Exercise;
          } catch {
            // For helpers or if fetch fails, return 0 (or undefined if we want to hide progress)
            // But we want to preserve the "undefined" for helpers if that was the intent.
            // The original code had a boolean "showProgress" flag.
            return {...ex, progressPercent: 0} as Exercise;
          }
        }),
      );
      return results;
    };
    
    // Just map over categories and update missions
    const updateCategories = async () => {
        const updated = await Promise.all(EXERCISE_CATEGORIES.map(async (cat) => {
            // Load progress for missions
            const missionsWithProg = await loadProgressForList(cat.missions);

            
            return {
                ...cat,
                missions: missionsWithProg,
                helperModules: cat.helperModules
            };
        }));
        
        if (!cancelled) {
            setCategoriesWithProgress(updated);
        }
    };

    if (show) {
        updateCategories();
    }

    return () => {
      cancelled = true;
    };
  }, [show]);

  if (!show) return null;

  const togglePanel = (categoryId: string) => {
    // Check lock
    const category = categoriesWithProgress.find(c => c.id === categoryId);
    if (!category) return;
    
    if (category.lock) {
        const { requiredBadgeKey, requiredLevel } = category.lock;
        const currentLevel = badges[requiredBadgeKey]?.badgeLevel ?? 'none';
        
        if (!isBadgeLevelSufficient(currentLevel, requiredLevel)) {
           return;
        }
    }
    
    setOpenPanels(prev => ({...prev, [categoryId]: !prev[categoryId]}));
  };

  const renderTopicBadges = (category: ExerciseCategory) => {
    // If locked, don't render badge here (logic moved to button content)
    // Actually the design had specific lock UI.
    const badge = badges[category.badgeKey];
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

  const isCategoryLocked = (category: ExerciseCategory) => {
      if (!category.lock) return false;
      const { requiredBadgeKey, requiredLevel } = category.lock;
      const currentLevel = badges[requiredBadgeKey]?.badgeLevel ?? 'none';
      return !isBadgeLevelSufficient(currentLevel, requiredLevel);
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
          {categoriesWithProgress.map(category => {
              const locked = isCategoryLocked(category);
              const isOpen = openPanels[category.id];
              const badge = badges[category.badgeKey];
              const avgAccuracy = badge ? Math.round(badge.avgAccuracy) : 0;
              
              return (
                <div
                    key={category.id}
                    className={`dashboard__accordion-item${locked ? ' dashboard__accordion-item--locked' : ''}`}>
                    <button
                    className={`dashboard__accordion-header${locked ? ' dashboard__accordion-header--locked' : ''}`}
                    onClick={() => togglePanel(category.id)}
                    aria-expanded={!!isOpen}
                    aria-disabled={locked}
                    disabled={locked}>
                    <span className="dashboard__accordion-title-row">
                        <span>
                        {locked && (
                            <span className="dashboard__lock-icon">🔒</span>
                        )}
                        {category.title}
                        </span>
                        {locked ? (
                        <span className="dashboard__locked-hint">
                            {category.lock?.hint}
                        </span>
                        ) : (
                        renderTopicBadges(category)
                        )}
                    </span>
                    <span className="dashboard__accordion-toggle">
                        {isOpen ? '▾' : '▸'}
                    </span>
                    </button>
                    <div
                    className={`dashboard__accordion-body ${isOpen ? 'is-open' : ''}`}
                    aria-hidden={!isOpen}>
                    <div className="dashboard__section">
                        <div className="dashboard__section-title-row">
                        <span className="dashboard__section-title">Missionen</span>
                        {badges[category.badgeKey] && (
                            <span className="dashboard__section-avg">
                            Ø Genauigkeit:{' '}
                            {avgAccuracy}%
                            </span>
                        )}
                        </div>
                        <ExercisesList
                        exercises={
                            locked
                            ? category.missions.map(ex => ({
                                ...ex,
                                disabled: true,
                                }))
                            : category.missions
                        }
                        />
                    </div>

                    <div className="dashboard__section-separator" />

                    <div className="dashboard__section">
                        <div className="dashboard__section-title">Hilfsmodule</div>
                        <ExercisesList
                        exercises={category.helperModules}
                        />
                    </div>
                    </div>
                </div>
              );
          })}
        </div>
      </div>
    </div>
  );
};

export default ExercisesModal;
