import React from 'react';
import MissionCategoryGroup from './MissionCategoryGroup.component';
import type {TableColumnDef} from '../interfaces/professorDashboard.interfaces';
import './MissionTable.component.scss';

interface CategoryGroupBase {
  category: string;
  displayName: string;
  missions: unknown[];
}

interface MissionTableProps<G extends CategoryGroupBase> {
  columns: TableColumnDef[];
  categoryGroups: G[];
  renderRow: (mission: G['missions'][number], index: number) => React.ReactNode;
  title?: string;
  titleIcon?: string;
}

function MissionTable<G extends CategoryGroupBase>({
  columns,
  categoryGroups,
  renderRow,
  title,
  titleIcon,
}: MissionTableProps<G>) {
  return (
    <div className="mission-table-wrapper">
      {title && (
        <div className="mission-table__title-bar">
          {titleIcon && (
            <span className="mission-table__title-icon">{titleIcon}</span>
          )}
          <span className="mission-table__title-text">{title}</span>
        </div>
      )}
      <table className="mission-table">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} className={col.className}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        {categoryGroups.map(group => (
          <MissionCategoryGroup
            key={group.category}
            group={group}
            colSpan={columns.length}
            renderRow={renderRow}
          />
        ))}
      </table>
    </div>
  );
}

export default MissionTable;
