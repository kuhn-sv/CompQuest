import type { TabItem } from '@shared/components/ui/tab-row/TabRow.component';
import type { ProfessorDashboardView } from '../interfaces/professorDashboard.interfaces';

/** Tabs for the main professor dashboard navigation */
export const DASHBOARD_TABS: TabItem<ProfessorDashboardView>[] = [
  { value: 'course-overview', label: 'Kursübersicht' },
  { value: 'player-profiles', label: 'Spielerprofile' },
];

