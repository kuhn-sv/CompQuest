import {useState, useEffect, useCallback} from 'react';
import {professorService} from '../../../services/supabase/professor.service';
import type {StudentListItem, StudentBadgeDto} from '../../../services/supabase/professor.service';
import {groupPlayerMissionsByCategory} from '../utils/professorDashboard.utils';
import type {PlayerCategoryGroup} from '../interfaces/professorDashboard.interfaces';

interface UsePlayerProfileResult {
  students: StudentListItem[];
  selectedId: string | null;
  setSelectedId: (id: string) => void;
  categoryGroups: PlayerCategoryGroup[];
  badges: StudentBadgeDto[];
  loading: boolean;
  error: string | null;
}

export function usePlayerProfile(): UsePlayerProfileResult {
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [categoryGroups, setCategoryGroups] = useState<PlayerCategoryGroup[]>([]);
  const [badges, setBadges] = useState<StudentBadgeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load student list on mount
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await professorService.getAllStudents();
        if (!cancelled) setStudents(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Fehler beim Laden der Studenten',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load selected student's data
  const fetchStudentData = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      const [stats, badgeData] = await Promise.all([
        professorService.getStudentExerciseStats(userId),
        professorService.getStudentBadges(userId),
      ]);

      setCategoryGroups(groupPlayerMissionsByCategory(stats));
      setBadges(badgeData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Fehler beim Laden der Profildaten',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedId) {
      fetchStudentData(selectedId);
    } else {
      setCategoryGroups([]);
      setBadges([]);
    }
  }, [selectedId, fetchStudentData]);

  return {
    students,
    selectedId,
    setSelectedId,
    categoryGroups,
    badges,
    loading,
    error,
  };
}
