import React from 'react';
import AccuracyRing from '../../../shared/components/AccuracyRing/AccuracyRing.component';
import {CATEGORY_DISPLAY_NAMES} from '../../../shared/context/badgeNotification.constants';
import {BADGE_TIERS} from '../../../shared/interfaces';
import type {StudentBadgeDto} from '../../../services/supabase/professor.service';
import './CategorySummaryCards.component.scss';

interface CategorySummaryCardsProps {
  badges: StudentBadgeDto[];
}

function getBadgeDisplay(level: string): {icon: string; label: string} {
  const tier = BADGE_TIERS.find(t => t.level === level);
  if (!tier || level === 'none') return {icon: '', label: 'Kein Badge'};
  return {icon: tier.icon, label: tier.label};
}

const CategorySummaryCards: React.FC<CategorySummaryCardsProps> = ({
  badges,
}) => {
  if (badges.length === 0) return null;

  return (
    <div className="category-summary-cards">
      {badges.map(badge => {
        const {icon, label} = getBadgeDisplay(badge.badgeLevel);
        const categoryName =
          CATEGORY_DISPLAY_NAMES[badge.category] ?? badge.category;

        return (
          <div key={badge.category} className="category-card">
            <div className="category-card__header">
              <span className="category-card__category">{categoryName}</span>
            </div>

            <div className="category-card__body">
              <div className="category-card__ring">
                <AccuracyRing accuracy={badge.avgAccuracy} size={64} />
              </div>
              <div className="category-card__details">
                <div className="category-card__stat">
                  <span className="category-card__stat-label">Präzision</span>
                  <span className="category-card__stat-value">
                    {Math.round(badge.avgAccuracy)}%
                  </span>
                </div>
                <div className="category-card__stat">
                  <span className="category-card__stat-label">Missionen</span>
                  <span className="category-card__stat-value">
                    {badge.completedTasks}/{badge.totalTasks}
                  </span>
                </div>
                {badge.badgeLevel !== 'none' && (
                  <div className="category-card__stat">
                    <span className="category-card__stat-label">Badge</span>
                    <span className="category-card__stat-value">
                      {icon} {label}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CategorySummaryCards;
