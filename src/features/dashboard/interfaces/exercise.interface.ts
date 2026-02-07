export interface Exercise {
  id: string;
  title: string;
  description: string;
  path: string;
  progressPercent?: number;
  disabled?: boolean;
}
