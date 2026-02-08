import React, {useState} from 'react';
import {Navigate} from 'react-router-dom';
import {useAuth} from '../auth';
import ProfessorHeader from './components/ProfessorHeader.component';
import CourseOverview from './components/CourseOverview.component';
import PlayerProfiles from './components/PlayerProfiles.component';
import {useCourseOverview} from './hooks/useCourseOverview';
import type {ProfessorDashboardView} from './interfaces/professorDashboard.interfaces';
import './professorDashboard.page.scss';

const ProfessorDashboardPage: React.FC = () => {
  const {userProfile} = useAuth();
  const [activeView, setActiveView] =
    useState<ProfessorDashboardView>('course-overview');
  const courseData = useCourseOverview();

  // Guard: only admins may access this page
  if (userProfile && userProfile.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="professor-dashboard">
      <ProfessorHeader activeView={activeView} onViewChange={setActiveView} />

      {activeView === 'course-overview' && (
        <CourseOverview
          categoryGroups={courseData.categoryGroups}
          totalStudents={courseData.totalStudents}
          loading={courseData.loading}
          error={courseData.error}
        />
      )}

      {activeView === 'player-profiles' && <PlayerProfiles />}
    </div>
  );
};

export default ProfessorDashboardPage;
