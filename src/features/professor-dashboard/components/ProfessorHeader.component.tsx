import React from 'react';
import {Link} from 'react-router-dom';
import TabRow from '@shared/components/ui/tab-row/TabRow.component';
import {DASHBOARD_TABS} from '../constants/professorDashboard.constants';
import type {ProfessorDashboardView} from '../interfaces/professorDashboard.interfaces';
import './ProfessorHeader.component.scss';

interface ProfessorHeaderProps {
  activeView: ProfessorDashboardView;
  onViewChange: (view: ProfessorDashboardView) => void;
}

const ProfessorHeader: React.FC<ProfessorHeaderProps> = ({
  activeView,
  onViewChange,
}) => {
  return (
    <header className="prof-header">
      <div className="prof-header__brand">
        <Link to="/dashboard" className="prof-header__brand-link">
          <img
            src="/favicon.svg"
            alt="CompQuest"
            className="prof-header__brand-icon"
          />
          <div className="prof-header__brand-text">
            <span className="prof-header__title">CompQuest</span>
            <span className="prof-header__subtitle">
              Lehrpersonen-Dashboard &bull; Status-Analyse
            </span>
          </div>
        </Link>
      </div>

      <div className="prof-header__tabs">
        <TabRow<ProfessorDashboardView>
          value={activeView}
          items={DASHBOARD_TABS}
          onSelect={onViewChange}
          ariaLabel="Dashboard-Ansicht"
          className="prof-header__tab-row"
        />
      </div>
    </header>
  );
};

export default ProfessorHeader;
