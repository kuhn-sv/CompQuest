/**
 * State passed via react-router `location.state` when navigating to the dashboard.
 * Reusable from ResultSummary, GameStartScreen, or any component that links back.
 */
export interface DashboardNavigationState {
  openExercises?: boolean;
}
