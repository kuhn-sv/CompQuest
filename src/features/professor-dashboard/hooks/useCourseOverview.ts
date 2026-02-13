import {useState, useEffect, useCallback} from 'react';
import {professorService} from '../../../services/supabase/professor.service';
import {groupMissionsByCategory} from '../utils/professorDashboard.utils';
import type {CategoryMissionGroup} from '../interfaces/professorDashboard.interfaces';

interface UseCourseOverviewResult {
  categoryGroups: CategoryMissionGroup[];
  totalStudents: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCourseOverview(): UseCourseOverviewResult {
  const [categoryGroups, setCategoryGroups] = useState<CategoryMissionGroup[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [missions, count] = await Promise.all([
        professorService.getMissionStats(),
        professorService.getTotalStudentCount(),
      ]);

      setCategoryGroups(groupMissionsByCategory(missions));
      setTotalStudents(count);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Fehler beim Laden der Daten';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {categoryGroups, totalStudents, loading, error, refetch: fetchData};
}
