import React from 'react';
import {Link} from 'react-router-dom';
import './TopNavbar.component.scss';

const TopNavbar: React.FC = () => {
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
      </div>
    </header>
  );
};

export default TopNavbar;
