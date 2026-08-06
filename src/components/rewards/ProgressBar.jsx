import React from 'react';

const ProgressBar = ({ percent, className = '', showLabel = true }) => {
  const value = Math.max(0, Math.min(100, Number(percent) || 0));
  return (
    <div className={`progress-bar-wrap ${className}`}>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${value}%` }} />
      </div>
      {showLabel && (
        <div className="progress-label">
          <span>{Math.round(value)}%</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
