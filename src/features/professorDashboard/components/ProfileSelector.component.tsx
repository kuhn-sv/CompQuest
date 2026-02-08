import React from 'react';
import type {StudentListItem} from '../../../services/supabase/professor.service';
import './ProfileSelector.component.scss';

interface ProfileSelectorProps {
  students: StudentListItem[];
  selectedId: string | null;
  onSelect: (studentId: string) => void;
  loading?: boolean;
}

const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  students,
  selectedId,
  onSelect,
  loading,
}) => {
  return (
    <div className="profile-selector">
      <label className="profile-selector__label" htmlFor="student-select">
        Spielerprofil
      </label>
      <select
        id="student-select"
        className="profile-selector__select"
        value={selectedId ?? ''}
        onChange={e => onSelect(e.target.value)}
        disabled={loading}>
        <option value="" disabled>
          Namen wählen…
        </option>
        {students.map(s => (
          <option key={s.id} value={s.id}>
            {s.displayName}
            {s.gamertag ? ` (${s.gamertag})` : ''}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ProfileSelector;
