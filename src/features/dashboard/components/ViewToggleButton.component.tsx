import React from 'react';

interface ViewToggleButtonProps {
  is3DView: boolean;
  isTablet: boolean;
  onToggle: () => void;
}

const ViewToggleButton: React.FC<ViewToggleButtonProps> = ({
  is3DView,
  isTablet,
  onToggle,
}) => {
  const title = is3DView
    ? 'Wechsle zu 2D Ansicht'
    : isTablet
      ? 'Wechsle zu 3D Ansicht (bei zu niedriger Performance wird automatisch zurück zu 2D gewechselt)'
      : 'Wechsle zu 3D Ansicht';

  return (
    <button
      className="dashboard__toggle-view-btn"
      onClick={onToggle}
      title={title}>
      {is3DView ? <span>2D</span> : <span>3D</span>}
    </button>
  );
};

export default ViewToggleButton;
