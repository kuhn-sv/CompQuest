import React from 'react';
import './MissionCategoryGroup.component.scss';

interface CategoryGroupBase {
  category: string;
  displayName: string;
  missions: unknown[];
}

interface MissionCategoryGroupProps<G extends CategoryGroupBase> {
  group: G;
  colSpan: number;
  renderRow: (mission: G['missions'][number], index: number) => React.ReactNode;
}

function MissionCategoryGroup<G extends CategoryGroupBase>({
  group,
  colSpan,
  renderRow,
}: MissionCategoryGroupProps<G>) {
  return (
    <tbody className="mission-category-group">
      <tr className="mission-category-group__header">
        <td colSpan={colSpan}>
          <span className="mission-category-group__dot" />
          <span className="mission-category-group__name">
            {group.displayName}
          </span>
        </td>
      </tr>
      {group.missions.map((mission, index) => renderRow(mission, index))}
    </tbody>
  );
}

export default MissionCategoryGroup;
