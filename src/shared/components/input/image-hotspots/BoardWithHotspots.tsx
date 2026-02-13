import React from 'react';
import './BoardWithHotspots.scss';

type Props = {
  /** optional className to pass through */
  className?: string;
  onCpuClick?: () => void;
};

// Image natural size: 1024 x 1536 (width x height)
const NATURAL_WIDTH = 1024;
const NATURAL_HEIGHT = 1536;

export const BoardWithHotspots: React.FC<Props> = ({className, onCpuClick}) => {
  // CPU coordinates in image pixels (center). Determined by image analysis.
  const cpuX = 512; // center horizontally
  const cpuY = 452; // determined centroid from image mask

  const handleOpen = () => {
    if (onCpuClick) onCpuClick();
  };

  return (
    <div className={`board-with-hotspots ${className || ''}`}>
      <svg
        viewBox={`0 0 ${NATURAL_WIDTH} ${NATURAL_HEIGHT}`}
        xmlns="http://www.w3.org/2000/svg"
        className="board-svg"
        role="img"
        aria-label="Motherboard with labelled components">
        <image
          href="/motherboard_components.png"
          x="0"
          y="0"
          width={NATURAL_WIDTH}
          height={NATURAL_HEIGHT}
          preserveAspectRatio="xMidYMid meet"
        />

        {/* CPU Hotspot as an accessible element: use <g> with role=button and a <title> for screen readers */}
        <g
          className="hotspot-group cpu-hotspot-group"
          role="button"
          tabIndex={0}
          aria-label="CPU information"
          onClick={handleOpen}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleOpen();
            }
          }}>
          <title>CPU</title>
          <circle className="hotspot" cx={cpuX} cy={cpuY} r={26} />
          {/* optional visible pulse ring */}
          <circle className="hotspot-ring" cx={cpuX} cy={cpuY} r={40} />
        </g>
      </svg>
    </div>
  );
};

export default BoardWithHotspots;
