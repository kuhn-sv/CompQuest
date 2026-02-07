import React from 'react';
import {Link} from 'react-router-dom';
import {useAuth} from '../../../features/auth';
import './TopNavbar.component.scss';

const TopNavbar: React.FC = () => {
  const {userProfile} = useAuth();
  const isAdmin = userProfile?.role === 'admin';

  return (
    <header className="cq-topnavbar">
      <div className="cq-topnavbar__inner">
        <div className="cq-topnavbar__brand">
          <Link to="/" className="cq-topnavbar__brand-link">
            <img
              src="/favicon.svg"
              alt="CompQuest"
              className="cq-topnavbar__brand-icon"
            />
            <span className="cq-topnavbar__brand-text">CompQuest</span>
          </Link>
        </div>

        {isAdmin && (
          <nav className="cq-topnavbar__nav">
            <Link to="/professor-dashboard" className="cq-topnavbar__link">
              Lehrpersonen-Dashboard
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default TopNavbar;
