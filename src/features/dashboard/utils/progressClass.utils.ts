import { getBadgeLevelForAccuracy } from '@shared/interfaces';

export const getProgressClass = (percent: number): string => {
  const level = getBadgeLevelForAccuracy(percent);
  return level !== 'none' ? `dashboard__exercise-progress--${level}` : '';
};
